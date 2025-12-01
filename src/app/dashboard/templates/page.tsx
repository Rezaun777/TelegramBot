'use client';

import { useState, useEffect } from 'react';
import TemplateForm from '@/components/admin/TemplateForm';
import TemplateList from '@/components/admin/TemplateList';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/templates');
      const data = await res.json();
      
      if (res.ok) {
        setTemplates(data);
      } else {
        setError(data.message || 'Failed to fetch templates');
      }
    } catch (err) {
      setError('An error occurred while fetching templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchTemplates();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete template');
      }
    } catch (err) {
      setError('An error occurred while deleting the template');
      console.error(err);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTemplate(null);
    fetchTemplates();
  };

  return (
    <div className="py-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Auto-Reply Templates
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => {
              setEditingTemplate(null);
              setShowForm(true);
            }}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Template
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {showForm ? (
        <div className="mt-6">
          <TemplateForm 
            template={editingTemplate} 
            onSuccess={handleFormSuccess} 
            onCancel={() => {
              setShowForm(false);
              setEditingTemplate(null);
            }} 
          />
        </div>
      ) : (
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <TemplateList 
              templates={templates} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          )}
        </div>
      )}
    </div>
  );
}