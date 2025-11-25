import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiFileText } from 'react-icons/fi';
import { personalAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CreateNoteModal from '../../components/modals/CreateNoteModal';
import toast from 'react-hot-toast';

const COLOR_CLASSES = {
  default: 'bg-white dark:bg-gray-800',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
  green: 'bg-green-50 dark:bg-green-900/20',
  blue: 'bg-blue-50 dark:bg-blue-900/20',
  purple: 'bg-purple-50 dark:bg-purple-900/20',
  pink: 'bg-pink-50 dark:bg-pink-900/20',
};

/**
 * My Notes Page - Personal notes management
 */
const MyNotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedTag, setSelectedTag] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await personalAPI.getNotes();
      setNotes(response.data.data.notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (noteData) => {
    try {
      await personalAPI.createNote(noteData);
      toast.success('Note created successfully!');
      await fetchNotes();
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
      throw error;
    }
  };

  const handleUpdateNote = async (noteData) => {
    try {
      await personalAPI.updateNote(editingNote._id, noteData);
      toast.success('Note updated successfully!');
      await fetchNotes();
      setEditingNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
      throw error;
    }
  };

  const handleDeleteNote = async () => {
    if (!deleteConfirm) return;

    try {
      await personalAPI.deleteNote(deleteConfirm._id);
      toast.success('Note deleted');
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const allTags = [...new Set(notes.flatMap(note => note.tags || []))];
  
  const filteredNotes = notes.filter(note => {
    if (selectedTag === 'all') return true;
    return note.tags?.includes(selectedTag);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Notes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your personal knowledge base
          </p>
        </div>
        <Button variant="primary" icon={<FiPlus />} onClick={() => setShowCreateModal(true)}>
          New Note
        </Button>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
          <FiTag className="text-gray-400 flex-shrink-0" />
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedTag === 'all'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FiFileText size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notes yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first note to start organizing your thoughts
            </p>
            <Button variant="primary" icon={<FiPlus />} onClick={() => setShowCreateModal(true)}>
              Create Note
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className={`rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow ${
                COLOR_CLASSES[note.color] || COLOR_CLASSES.default
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1 mr-2">
                  {note.title}
                </h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setEditingNote(note);
                      setShowCreateModal(true);
                    }}
                    className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title="Edit note"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(note)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete note"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              {note.content && (
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-4 whitespace-pre-wrap">
                  {note.content}
                </p>
              )}

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag, idx) => (
                    <Badge key={idx} variant="default" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(note.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateNoteModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingNote(null);
        }}
        onSuccess={editingNote ? handleUpdateNote : handleCreateNote}
        note={editingNote}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteNote}
        title="Delete Note"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default MyNotesPage;
