import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';

/**
 * Create Resource Modal Component
 */
const CreateResourceModal = ({ isOpen, onClose, onSuccess, type }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    content: '',
    file: null,
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file,
      }));
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim()) && formData.tags.length < 10) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (type === 'LINK' && !formData.url.trim()) {
      setError('URL is required for link resources');
      return;
    }

    if (type === 'FILE' && !formData.file) {
      setError('Please select a file to upload');
      return;
    }

    if (type === 'NOTE' && !formData.content.trim()) {
      setError('Content is required for notes');
      return;
    }

    setLoading(true);
    try {
      const data = {
        type,
        title: formData.title,
        description: formData.description,
        tags: formData.tags,
      };

      if (type === 'LINK') {
        data.url = formData.url;
      } else if (type === 'FILE') {
        data.file = formData.file;
      } else if (type === 'NOTE') {
        data.content = formData.content;
      }

      await onSuccess(data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create resource');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      content: '',
      file: null,
      tags: [],
    });
    setTagInput('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Add ${type}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter resource title"
          required
        />

        <Textarea
          label="Description (optional)"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter resource description"
          rows={3}
        />

        {type === 'LINK' && (
          <Input
            label="URL"
            name="url"
            type="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://example.com"
            required
          />
        )}

        {type === 'FILE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              required
            />
            {formData.file && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {formData.file.name}
              </p>
            )}
          </div>
        )}

        {type === 'NOTE' && (
          <Textarea
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter note content"
            rows={8}
            required
          />
        )}

        {/* Tags Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags (optional)
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type and press Enter to add tags"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Press Enter to add tag. Max 10 tags.
          </p>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-primary-900 dark:hover:text-primary-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateResourceModal;
