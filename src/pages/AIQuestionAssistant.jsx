import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, File, Image, Bot, User, CheckCircle, Loader, Download, Plus, X } from 'lucide-react';

const AIQuestionAssistant = () => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', content: 'Hi! Upload your document (PDF, image, or text) and I\'ll help you generate questions from it.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [formData, setFormData] = useState({
    category: 'Basic Sciences',
    subjects: [],
    difficulty: 'medium'
  });
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const subjectsByCategory = {
    'Basic Sciences': ['Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Pharmacology', 'Microbiology'],
    'Organ Systems': ['Cardiovascular', 'Respiratory', 'Nervous System', 'Digestive', 'Endocrine', 'Musculoskeletal'],  
    'Clinical Specialties': ['Internal Medicine', 'Surgery', 'Pediatrics', 'Obstetrics', 'Psychiatry', 'Emergency Medicine']
  };

  // Detect theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles([...uploadedFiles, ...files]);
    
    files.forEach(file => {
      const message = {
        id: Date.now() + Math.random(),
        type: 'user',
        content: `Uploaded: ${file.name}`,
        file: file
      };
      setMessages(prev => [...prev, message]);
    });
    
    // Simulate AI processing
    setTimeout(() => {
      generateQuestionsFromFiles(files);
    }, 1000);
  };

  const generateQuestionsFromFiles = async (files) => {
    setIsGenerating(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock generated questions based on file type
    const mockQuestions = [
      {
        id: 1,
        questionText: "What is the primary function of the mitochondria in cellular respiration?",
        options: [
          "Protein synthesis",
          "ATP production through oxidative phosphorylation",
          "DNA replication",
          "Lipid metabolism"
        ],
        correctAnswer: 1,
        explanation: "Mitochondria are the powerhouses of the cell, primarily responsible for ATP production through the process of oxidative phosphorylation during cellular respiration."
      },
      {
        id: 2,
        questionText: "Which of the following best describes the structure of the cell membrane?",
        options: [
          "Single layer of phospholipids",
          "Double layer of proteins",
          "Phospholipid bilayer with embedded proteins",
          "Triple layer of carbohydrates"
        ],
        correctAnswer: 2,
        explanation: "The cell membrane consists of a phospholipid bilayer with various proteins embedded within it, forming a selectively permeable barrier."
      },
      {
        id: 3,
        questionText: "What is the role of ribosomes in protein synthesis?",
        options: [
          "DNA transcription",
          "mRNA translation",
          "Lipid synthesis",
          "Cell division"
        ],
        correctAnswer: 1,
        explanation: "Ribosomes are responsible for translating mRNA into proteins by assembling amino acids in the correct sequence."
      }
    ];

    const botMessage = {
      id: Date.now(),
      type: 'bot',
      content: 'I\'ve analyzed your document and generated some questions. Click on any question to customize and add it to your question bank.',
      questions: mockQuestions
    };

    setMessages(prev => [...prev, botMessage]);
    setIsGenerating(false);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'I understand your request. Please upload a document first, and I\'ll help you generate relevant questions from it.'
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
    setShowQuestionForm(true);
  };

  const handleSubjectToggle = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSubmitQuestion = async () => {
    if (!selectedQuestion || formData.subjects.length === 0) return;

    setIsUploading(true);

    const submissionData = {
      questionText: selectedQuestion.questionText,
      explanation: selectedQuestion.explanation,
      options: selectedQuestion.options.map((text, index) => ({
        text,
        media: []
      })),
      correctAnswer: selectedQuestion.correctAnswer,
      difficulty: formData.difficulty,
      category: formData.category,
      subjects: formData.subjects.map(name => ({ name, topics: [] })),
      tags: [],
      questionMedia: [],
      explanationMedia: [],
      sourceUrl: ''
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const successMessage = {
      id: Date.now(),
      type: 'bot',
      content: `✅ Question successfully added to your question bank! Category: ${formData.category}, Subjects: ${formData.subjects.join(', ')}, Difficulty: ${formData.difficulty}`
    };

    setMessages(prev => [...prev, successMessage]);
    setShowQuestionForm(false);
    setSelectedQuestion(null);
    setFormData({ category: 'Basic Sciences', subjects: [], difficulty: 'medium' });
    setIsUploading(false);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-500 text-white p-4">
        <h2 className="text-xl font-bold flex items-center">
          <Bot className="mr-2" />
          AI Question Assistant
        </h2>
        <p className="text-blue-100 dark:text-blue-200 text-sm">Upload documents and generate questions with AI assistance</p>
      </div>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.type === 'user' 
                ? 'bg-blue-600 dark:bg-blue-500 text-white' 
                : 'bg-white dark:bg-gray-700 border dark:border-gray-600 shadow-sm'
            }`}>
              <div className="flex items-start">
                {message.type === 'bot' && <Bot className="w-4 h-4 mr-2 mt-1 text-blue-600 dark:text-blue-300" />}
                {message.type === 'user' && <User className="w-4 h-4 mr-2 mt-1" />}
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{message.content}</p>
                  {message.file && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/50 rounded flex items-center">
                      <File className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
                      <span className="text-xs text-gray-700 dark:text-gray-200">{message.file.name}</span>
                    </div>
                  )}
                  {message.questions && (
                    <div className="mt-3 space-y-2">
                      {message.questions.map((question) => (
                        <div key={question.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded border dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                             onClick={() => handleQuestionSelect(question)}>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{question.questionText}</p>
                          <div className="mt-2 space-y-1">
                            {question.options.map((option, idx) => (
                              <p key={idx} className={`text-xs ${idx === question.correctAnswer ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                                {String.fromCharCode(65 + idx)}. {option}
                              </p>
                            ))}
                          </div>
                          <button className="mt-2 text-xs text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">
                            Click to customize →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isGenerating && (
          <div className="flex justify-start mb-4">
            <div className="bg-white dark:bg-gray-700 border dark:border-gray-600 shadow-sm rounded-lg px-4 py-2">
              <div className="flex items-center">
                <Bot className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-300" />
                <Loader className="w-4 h-4 animate-spin mr-2 text-gray-600 dark:text-gray-300" />
                <span className="text-sm text-gray-800 dark:text-gray-200">Analyzing document and generating questions...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/50 border-t dark:border-gray-700">
          <p className="text-xs text-blue-800 dark:text-blue-300 mb-2">Uploaded Files:</p>
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs">
                <File className="w-3 h-3 mr-1 text-gray-600 dark:text-gray-300" />
                <span className="max-w-20 truncate text-gray-700 dark:text-gray-200">{file.name}</span>
                <button onClick={() => removeFile(index)} className="ml-1 text-red-500 dark:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message or upload a document..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept=".pdf,.doc,.docx,.txt,image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-600 border border-gray-300 dark:border-gray-400 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600"
          >
            <Upload className="w-5 h-5" />
          </button>
          <button
            onClick={handleSendMessage}
            className="p-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Question Customization Modal */}
      {showQuestionForm && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-white dark:bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-200">Customize Question</h3>
            
            {/* Question Preview */}
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedQuestion.questionText}</p>
              <div className="mt-2 space-y-1">
                {selectedQuestion.options.map((option, idx) => (
                  <p key={idx} className={`text-sm ${idx === selectedQuestion.correctAnswer ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                    {String.fromCharCode(65 + idx)}.{option}</p>
                ))}
              </div>

            </div> {/* Category Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category*</label>
              <div className="flex gap-2">
                {Object.keys(subjectsByCategory).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFormData(prev => ({ ...prev, category: cat, subjects: [] }))}
                    className={`px-3 py-1 text-xs rounded ${
                      formData.category === cat
                        ? 'bg-blue-500 dark:bg-blue-400 text-white'
                        : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Subjects* (Select multiple)</label>
              <div className="grid grid-cols-2 gap-2">
                {subjectsByCategory[formData.category]?.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => handleSubjectToggle(subject)}
                    className={`px-3 py-1 text-xs rounded ${
                      formData.subjects.includes(subject)
                        ? 'bg-green-500 dark:bg-green-400 text-white'
                        : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Difficulty*</label>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setFormData(prev => ({ ...prev, difficulty: level }))}
                    className={`px-3 py-1 text-xs rounded capitalize ${
                      formData.difficulty === level
                        ? 'bg-orange-500 dark:bg-orange-400 text-white'
                        : 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowQuestionForm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuestion}
                disabled={formData.subjects.length === 0 || isUploading}
                className={`px-4 py-2 rounded text-white ${
                  formData.subjects.length === 0 || isUploading
                    ? 'bg-gray-400 dark:bg-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Adding...
                  </div>
                ) : (
                  'Add Question'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIQuestionAssistant;