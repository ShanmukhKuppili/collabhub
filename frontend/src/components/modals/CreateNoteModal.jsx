import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

const COLORS = [
  { name: 'default', bg: 'bg-white dark:bg-gray-800', label: 'Default' },
  { name: 'yellow', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'Yellow' },
  { name: 'green', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Green' },
  { name: 'blue', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Blue' },
  { name: 'purple', bg: 'bg-purple-50 dark:bg-purple-900/20', label: 'Purple' },
  { name: 'pink', bg: 'bg-pink-50 dark:bg-pink-900/20', label: 'Pink' },
];

/**
 * Modal for creating/editing notes
 */
const CreateNoteModal = ({ isOpen, onClose, onSuccess, note = null, groupId = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    color: 'default',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate form when editing a note
  useEffect(() => {
    if (note && isOpen) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        tags: note.tags?.join(', ') || '',
        color: note.color || 'default',
      });
    } else if (!note && isOpen) {
      // Reset form when creating new note
      setFormData({
        title: '',
        content: '',
        tags: '',
        color: 'default',
      });
    }
  }, [note, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const noteData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      };

      await onSuccess(noteData);
      
      setFormData({ title: '', content: '', tags: '', color: 'default' });
      onClose();
    } catch (err) {
      console.error('Error saving note:', err);
      setError(err.response?.data?.message || 'Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={note ? 'Edit Note' : 'Create Note'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Note title"
        />

        <Textarea
          label="Content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={6}
          placeholder="Write your note..."
        />

        <Input
          label="Tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="work, ideas, project (comma-separated)"
          helpText="Separate tags with commas"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <div className="flex space-x-2">
            {COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setFormData({ ...formData, color: color.name })}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${color.bg} ${
                  formData.color === color.name
                    ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                title={color.label}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {note ? 'Update' : 'Create'} Note
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateNoteModal;
