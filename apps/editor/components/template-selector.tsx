'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { Template } from '@docmaps/database';
import { X, Check } from 'lucide-react';

interface TemplateSelectorProps {
  onSelect: (template: Template | null) => void;
  onClose: () => void;
}

export function TemplateSelector({ onSelect, onClose }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .eq('is_active', true)
          .order('category', { ascending: true });

        if (error) throw error;
        setTemplates((data as Template[]) || []);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSelect = () => {
    onSelect(selectedTemplate);
    onClose();
  };

  // Group templates by category
  const templatesByCategory = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
            <p className="text-sm text-gray-600 mt-1">
              Start with a pre-built structure or create from scratch
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading templates...</div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Blank Template */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Start Fresh</h3>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className={`w-full text-left rounded-lg border-2 p-6 transition-all ${
                    selectedTemplate === null
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Blank Canvas</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Start with an empty map and build from scratch
                      </p>
                    </div>
                    {selectedTemplate === null && (
                      <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              </div>

              {/* Template Categories */}
              {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`text-left rounded-lg border-2 p-4 transition-all ${
                          selectedTemplate?.id === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{template.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {template.description}
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                              <span>{template.nodes.length} nodes</span>
                              <span>•</span>
                              <span>{template.edges.length} edges</span>
                            </div>
                          </div>
                          {selectedTemplate?.id === template.id && (
                            <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center ml-3">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
