'use client';

import { useState, useEffect } from 'react';
import { X, Check, Loader2, Layers, FileText, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { Template } from '@docmaps/database';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Choose a Template</h2>
              <p className="text-sm text-gray-500">Start with a pre-built structure or create from scratch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-500">Loading templates...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Blank Template */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Start Fresh</h3>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className={`w-full text-left rounded-xl border-2 p-6 transition-all ${
                    selectedTemplate === null
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedTemplate === null 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                        : 'bg-gray-100'
                    }`}>
                      <FileText className={`h-6 w-6 ${selectedTemplate === null ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">Blank Canvas</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Start with an empty map and build from scratch
                      </p>
                    </div>
                    {selectedTemplate === null && (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              </div>

              {/* Template Categories */}
              {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`text-left rounded-xl border-2 p-5 transition-all ${
                          selectedTemplate?.id === template.id
                            ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500/20'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            selectedTemplate?.id === template.id 
                              ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                              : 'bg-gray-100'
                          }`}>
                            <Layers className={`h-5 w-5 ${selectedTemplate?.id === template.id ? 'text-white' : 'text-gray-400'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900">{template.name}</h4>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {template.description}
                            </p>
                            <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                {template.nodes.length} nodes
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                {template.edges.length} edges
                              </span>
                            </div>
                          </div>
                          {selectedTemplate?.id === template.id && (
                            <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {templates.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <Layers className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No templates available yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start with a blank canvas</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
          >
            Continue with {selectedTemplate ? selectedTemplate.name : 'Blank Canvas'}
          </button>
        </div>
      </div>
    </div>
  );
}
