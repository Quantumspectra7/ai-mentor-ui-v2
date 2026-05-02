'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Folder, Plus, Trash2, CheckCircle2, ChevronDown, ChevronRight, BarChart3, Database, FileText, Upload, File, Eye, X, Download } from 'lucide-react';
import { saveFile, getFile, deleteFileRecord } from '@/lib/fileDB';
import { StudyPlanProfile } from '@/lib/studyPlanProfile';
import { Input } from '@/components/ui/input';

interface Unit {
  id: string;
  name: string;
  completed: boolean;
}
import { FileDropzone } from '@/components/features/FileDropzone';
interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  dateAdded: string;
}

interface SubjectDetail {
  name: string;
  units: Unit[];
  files?: FileItem[];
}

interface MyCornerData {
  subjects: Record<string, SubjectDetail>;
}

interface MyCornerProps {
  onBack: () => void;
  userProfile: StudyPlanProfile;
}

export function MyCorner({ onBack, userProfile }: MyCornerProps) {
  const [data, setData] = useState<MyCornerData>({ subjects: {} });
  const [expandedSubj, setExpandedSubj] = useState<string | null>(null);
  const [newUnitName, setNewUnitName] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [viewingFileUrl, setViewingFileUrl] = useState<{url: string, name: string, type: string, textContent?: string} | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const addSubject = () => {
    const trimmed = newSubjectName.trim();
    if (!trimmed) return;
    const newData = { ...data };
    if (!newData.subjects[trimmed]) {
      newData.subjects[trimmed] = { name: trimmed, units: [], files: [] };
      saveData(newData);
    }
    setNewSubjectName('');
  };

  const deleteSubject = (subjectName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete ${subjectName}? All units inside will be lost.`)) return;
    const newData = { ...data };
    delete newData.subjects[subjectName];
    saveData(newData);
  };

  // Initialize and load data
  useEffect(() => {
    try {
      const saved = localStorage.getItem('myCornerData');
      let parsedData: MyCornerData = saved ? JSON.parse(saved) : { subjects: {} };

      // Ensure all subjects from profile exist in data
      let updated = false;
      const subjectsToTrack = [...(userProfile.currentSubjects || [])];
      if (userProfile.dsaTopic) {
        subjectsToTrack.push(`DSA: ${userProfile.dsaTopic}`);
      }

      subjectsToTrack.forEach(sub => {
        if (!parsedData.subjects[sub]) {
          parsedData.subjects[sub] = { name: sub, units: [], files: [] };
          updated = true;
        } else if (!parsedData.subjects[sub].files) {
          parsedData.subjects[sub].files = [];
          updated = true;
        }
      });

      if (updated) {
        localStorage.setItem('myCornerData', JSON.stringify(parsedData));
      }
      setData(parsedData);
    } catch {
      setData({ subjects: {} });
    }
  }, [userProfile]);

  const saveData = (newData: MyCornerData) => {
    setData(newData);
    localStorage.setItem('myCornerData', JSON.stringify(newData));
  };

  const addUnit = (subjectName: string) => {
    if (!newUnitName.trim()) return;
    const newData = { ...data };
    newData.subjects[subjectName].units.push({
      id: Date.now().toString(),
      name: newUnitName.trim(),
      completed: false
    });
    saveData(newData);
    setNewUnitName('');
  };

  const toggleUnit = (subjectName: string, unitId: string) => {
    const newData = { ...data };
    const unit = newData.subjects[subjectName].units.find(u => u.id === unitId);
    if (unit) {
      unit.completed = !unit.completed;
      saveData(newData);
    }
  };

  const deleteUnit = (subjectName: string, unitId: string) => {
    const newData = { ...data };
    newData.subjects[subjectName].units = newData.subjects[subjectName].units.filter(u => u.id !== unitId);
    saveData(newData);
  };

  const handleFileUpload = async (subjectName: string, file: File) => {
    const newData = { ...data };
    if (!newData.subjects[subjectName].files) {
      newData.subjects[subjectName].files = [];
    }
    
    const fileId = Date.now().toString();
    try {
      await saveFile(fileId, file);
    } catch (e) {
      alert("Failed to save file to local database.");
      throw e;
    }
    
    newData.subjects[subjectName].files!.push({
      id: fileId,
      name: file.name,
      type: file.type || 'unknown',
      size: file.size,
      dateAdded: new Date().toISOString()
    });
    
    saveData(newData);
  };

  const deleteFile = async (subjectName: string, fileId: string) => {
    const newData = { ...data };
    if (newData.subjects[subjectName].files) {
      newData.subjects[subjectName].files = newData.subjects[subjectName].files!.filter(f => f.id !== fileId);
      saveData(newData);
      try {
        await deleteFileRecord(fileId);
      } catch (e) {
        console.error("Failed to delete from IndexedDB", e);
      }
    }
  };

  const viewFile = async (fileId: string, fileName: string, fileType: string) => {
    try {
      const file = await getFile(fileId);
      if (!file) {
        alert("File not found! It might have been deleted.");
        return;
      }
      const url = URL.createObjectURL(file);
      
      let textContent = undefined;
      const lowerName = fileName.toLowerCase();

      // Native text files
      if (fileType.includes('text') || lowerName.endsWith('.txt') || lowerName.endsWith('.md') || lowerName.endsWith('.csv') || lowerName.endsWith('.json') || lowerName.endsWith('.js') || lowerName.endsWith('.ts') || lowerName.endsWith('.py')) {
        textContent = await file.text();
      } 
      // PPTX and DOCX via backend extraction
      else if (lowerName.endsWith('.pptx') || lowerName.endsWith('.docx')) {
        setIsExtracting(true);
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const res = await fetch('/api/study/extract-text', {
            method: 'POST',
            body: formData
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.text) {
              textContent = `--- EXTRACTED TEXT FROM ${fileName.toUpperCase()} ---\n\n${data.text}`;
            }
          }
        } catch (err) {
          console.error("Text extraction failed:", err);
        }
        setIsExtracting(false);
      }
      
      setViewingFileUrl({ url, name: fileName, type: fileType, textContent });
    } catch (e) {
      setIsExtracting(false);
      alert("Failed to load file.");
    }
  };

  const closeViewer = () => {
    if (viewingFileUrl) {
      URL.revokeObjectURL(viewingFileUrl.url);
      setViewingFileUrl(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const calculateProgress = (units: Unit[]) => {
    if (units.length === 0) return 0;
    const completed = units.filter(u => u.completed).length;
    return Math.round((completed / units.length) * 100);
  };

  const allSubjects = Object.values(data.subjects);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-card border hover:bg-accent text-foreground transition-colors shrink-0 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold truncate flex items-center gap-2">
                <Folder className="w-5 h-5 text-primary shrink-0" />
                My Corner / Subjects
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Track your syllabus and content completion.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-card border rounded-2xl p-4 mb-8 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div>
            <h2 className="font-bold text-foreground">Create New Folder</h2>
            <p className="text-xs text-muted-foreground">Add a new subject, project, or topic area to track.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Input 
              placeholder="e.g. Operating Systems..." 
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addSubject(); }}
              className="h-10 text-sm bg-background border-input flex-1 md:w-64"
            />
            <button 
              onClick={addSubject}
              className="h-10 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {allSubjects.length === 0 ? (
          <div className="text-center py-20 border rounded-3xl bg-card shadow-sm">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-foreground">No Folders Found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              Use the field above to create a new folder, or go to setup to add your current subjects.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {allSubjects.map((sub, idx) => {
              const isExpanded = expandedSubj === sub.name;
              const progress = calculateProgress(sub.units);
              
              return (
                <div key={sub.name} className="bg-card border rounded-3xl shadow-sm overflow-hidden flex flex-col h-fit">
                  <div 
                    className="p-6 cursor-pointer hover:bg-accent/50 transition-colors flex items-start gap-4"
                    onClick={() => setExpandedSubj(isExpanded ? null : sub.name)}
                  >
                    <div className="p-3 rounded-2xl bg-primary/10 shrink-0">
                      {sub.name.startsWith('DSA:') ? <Database className="w-6 h-6 text-primary" /> : <BookOpen className="w-6 h-6 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-foreground truncate pr-2">{sub.name}</h3>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => deleteSubject(sub.name, e)}
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Delete Folder"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-muted-foreground">{sub.units.length} Units</span>
                        <span className="text-xs font-bold text-primary">{progress}%</span>
                      </div>
                      <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t bg-accent/20">
                      <div className="space-y-2 mt-4">
                        {sub.units.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4 italic">No units/topics added yet.</p>
                        ) : (
                          sub.units.map(unit => (
                            <div key={unit.id} className={`flex items-center justify-between p-3 rounded-xl border bg-background transition-all hover:border-primary/50 shadow-sm ${unit.completed ? 'border-primary/30 bg-primary/5' : ''}`}>
                              <div 
                                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                                onClick={() => toggleUnit(sub.name, unit.id)}
                              >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${unit.completed ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                                  {unit.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </div>
                                <span className={`text-sm font-medium truncate ${unit.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                  {unit.name}
                                </span>
                              </div>
                              <button 
                                onClick={() => deleteUnit(sub.name, unit.id)}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Unit Form */}
                      <div className="mt-4 flex gap-2">
                        <Input 
                          placeholder="Add topic, unit, or chapter..." 
                          value={newUnitName}
                          onChange={(e) => setNewUnitName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') addUnit(sub.name); }}
                          className="h-10 text-sm bg-background border-input"
                        />
                        <button 
                          onClick={() => addUnit(sub.name)}
                          className="h-10 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 flex items-center gap-1 shrink-0"
                        >
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      </div>

                      {/* Resources & Files */}
                      <div className="mt-6 pt-6 border-t border-border">
                        <div className="flex flex-col gap-4 mb-4">
                          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" /> Resources & Files
                          </h4>
                          <FileDropzone onDropAccepted={(file) => handleFileUpload(sub.name, file)} maxSizeMB={5} />
                        </div>

                        <div className="space-y-2">
                          {(!sub.files || sub.files.length === 0) ? (
                            <p className="text-sm text-muted-foreground text-center py-4 italic">No files uploaded yet.</p>
                          ) : (
                            sub.files.map(file => (
                              <div key={file.id} className="flex items-center justify-between p-3 rounded-xl border bg-background hover:border-primary/50 transition-colors shadow-sm">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="p-2 rounded-lg bg-primary/10 shrink-0 text-primary">
                                    <File className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{formatFileSize(file.size)} • Added {new Date(file.dateAdded).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                  <button 
                                    onClick={() => viewFile(file.id, file.name, file.type)}
                                    className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors"
                                    title="View File"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => deleteFile(sub.name, file.id)}
                                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    title="Delete File"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* File Viewer Modal */}
      {isExtracting && (
        <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 font-bold text-foreground text-lg animate-pulse">Extracting document text...</p>
          <p className="text-sm text-muted-foreground mt-2">Converting presentation to readable notes.</p>
        </div>
      )}
      {viewingFileUrl && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b flex justify-between items-center bg-card shadow-sm">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <File className="w-5 h-5 text-primary" />
              {viewingFileUrl.name}
            </h3>
            <button onClick={closeViewer} className="p-2 bg-muted hover:bg-accent hover:text-destructive rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 w-full h-full p-4 md:p-8 bg-muted/30">
            {viewingFileUrl.textContent !== undefined ? (
              <div className="w-full h-full bg-[#fcfbf7] rounded-2xl border shadow-inner p-6 overflow-auto font-mono text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed ring-1 ring-black/5">
                {viewingFileUrl.textContent}
              </div>
            ) : viewingFileUrl.type.includes('pdf') ? (
              <iframe src={viewingFileUrl.url} className="w-full h-full rounded-2xl border shadow-lg bg-white" />
            ) : viewingFileUrl.type.includes('image') ? (
              <img src={viewingFileUrl.url} className="max-w-full max-h-full object-contain mx-auto rounded-lg shadow-lg" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center max-w-sm mx-auto">
                <div className="p-6 bg-primary/10 rounded-full">
                  <FileText className="w-16 h-16 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Preview not available</h3>
                <p className="text-muted-foreground mb-4">This file type cannot be previewed directly in the browser.</p>
                <a 
                  href={viewingFileUrl.url} 
                  download={viewingFileUrl.name} 
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download File
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
