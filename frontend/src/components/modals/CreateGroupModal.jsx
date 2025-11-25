import React, { useState } from 'react';
import { FiUsers, FiFileText, FiGlobe, FiLock } from 'react-icons/fi';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

/**
 * Create Group Modal Component
 * Form to create a new group
 */
const CreateGroupModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'private',
    tags: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    
    // Convert tags string to array
    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    const groupData = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      tags: tagsArray,
    };
    
    try {
      await onSuccess(groupData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'private',
        tags: '',
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Create group error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        type: 'private',
        tags: '',
      });
      setErrors({});
      onClose();
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Group"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Group Name"
          name="name"
          type="text"
          placeholder="e.g., Project Alpha Team"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          icon={<FiUsers />}
          required
        />
        
        <Textarea
          label="Description"
          name="description"
          placeholder="What is this group about?"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          icon={<FiFileText />}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Privacy
          </label>
          <div className="space-y-2">
            <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
              formData.type === 'private'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}>
              <input
                type="radio"
                name="type"
                value="private"
                checked={formData.type === 'private'}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600"
              />
              <FiLock className="ml-3 mr-2 text-gray-600 dark:text-gray-400" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">Private</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Only invited members can join</div>
              </div>
            </label>
            
            <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
              formData.type === 'public'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}>
              <input
                type="radio"
                name="type"
                value="public"
                checked={formData.type === 'public'}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600"
              />
              <FiGlobe className="ml-3 mr-2 text-gray-600 dark:text-gray-400" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">Public</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Anyone can join and request access</div>
              </div>
            </label>
          </div>
        </div>
        
        <Input
          label="Tags (comma separated)"
          name="tags"
          type="text"
          placeholder="e.g., development, design, marketing"
          value={formData.tags}
          onChange={handleChange}
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateGroupModal;
