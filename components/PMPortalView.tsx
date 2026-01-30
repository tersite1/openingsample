import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Button } from './Components';
import {
  User, Phone, Mail, Camera, Save, LogOut, Briefcase, MessageCircle,
  ChevronRight, Check, Clock, Loader2, Send, ArrowRight, X,
  Star, Award, MapPin, Calendar, CheckCircle, AlertTriangle
} from 'lucide-react';

interface PMPortalViewProps {
  pmId: string;
  onLogout: () => void;
}

interface Project {
  id: string;
  business_category: string;
  location_dong: string;
  store_size: number;
  estimated_total: number;
  status: string;
  current_step: number;
  pm_approved_step: number;
  pm_notes: string;
  created_at: string;
  user_id: string;
}

interface Message {
  id: string;
  project_id: string;
  sender_type: 'USER' | 'PM' | 'SYSTEM';
  message: string;
  created_at: string;
}

interface PMProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  profile_image: string;
  introduction: string;
  specialties: string[];
  rating: number;
  completed_projects: number;
  is_available: boolean;
}

const STEP_LABELS: Record<number, string> = {
  1: '업종 선택',
  2: '위치 선택',
  3: '상권 분석',
  4: '매장 규모',
  5: '체크리스트',
  6: '비용 확인',
  7: 'PM 배정됨',
  8: '창업 진행중',
  9: '완료/사후관리'
};

export const PMPortalView: React.FC<PMPortalViewProps> = ({ pmId, onLogout }) => {
  const [profile, setProfile] = useState<PMProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<PMProfile>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPMData();
  }, [pmId]);

  useEffect(() => {
    if (selectedProject) {
      loadMessages(selectedProject.id);
      subscribeToMessages(selectedProject.id);
    }
  }, [selectedProject]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadPMData = async () => {
    setLoading(true);

    // PM 프로필 로드
    const { data: pmData } = await supabase
      .from('project_managers')
      .select('*')
      .eq('id', pmId)
      .single();

    if (pmData) {
      setProfile(pmData);
      setProfileForm(pmData);
    }

    // 담당 프로젝트 로드
    const { data: projectsData } = await supabase
      .from('startup_projects')
      .select('*')
      .eq('pm_id', pmId)
      .order('created_at', { ascending: false });

    if (projectsData) {
      setProjects(projectsData);
      if (projectsData.length > 0 && !selectedProject) {
        setSelectedProject(projectsData[0]);
      }
    }

    setLoading(false);
  };

  const loadMessages = async (projectId: string) => {
    const { data } = await supabase
      .from('project_messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');

    if (data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = (projectId: string) => {
    const channel = supabase
      .channel(`pm-project-${projectId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'project_messages',
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedProject) return;

    setSending(true);
    await supabase.from('project_messages').insert({
      project_id: selectedProject.id,
      sender_type: 'PM',
      message: newMessage.trim()
    });

    setNewMessage('');
    setSending(false);
  };

  const advanceProjectStep = async () => {
    if (!selectedProject) return;

    const nextStep = selectedProject.current_step + 1;
    if (nextStep > 9) return;

    const { error } = await supabase
      .from('startup_projects')
      .update({
        current_step: nextStep,
        pm_approved_step: nextStep,
        status: nextStep >= 8 ? 'IN_PROGRESS' : 'PM_ASSIGNED'
      })
      .eq('id', selectedProject.id);

    if (!error) {
      // 시스템 메시지 전송
      await supabase.from('project_messages').insert({
        project_id: selectedProject.id,
        sender_type: 'SYSTEM',
        message: `✅ PM이 다음 단계로 진행을 승인했습니다: ${STEP_LABELS[nextStep]}`
      });

      setSelectedProject({ ...selectedProject, current_step: nextStep, pm_approved_step: nextStep });
      loadPMData();
    }
  };

  const updateProfile = async () => {
    if (!profile) return;

    const { error } = await supabase
      .from('project_managers')
      .update({
        name: profileForm.name,
        phone: profileForm.phone,
        introduction: profileForm.introduction,
        specialties: profileForm.specialties,
        is_available: profileForm.is_available
      })
      .eq('id', profile.id);

    if (!error) {
      setProfile({ ...profile, ...profileForm });
      setEditingProfile(false);
    }
  };

  const uploadProfileImage = async (file: File) => {
    if (!profile) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `pm_${profile.id}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(fileName, file);

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);

      await supabase
        .from('project_managers')
        .update({ profile_image: urlData.publicUrl })
        .eq('id', profile.id);

      setProfile({ ...profile, profile_image: urlData.publicUrl });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-brand-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 사이드바 - 프로필 & 프로젝트 목록 */}
      <aside className="w-80 bg-white border-r flex flex-col">
        {/* PM 프로필 */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <img
                src={profile?.profile_image || '/favicon-new.png'}
                alt={profile?.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-brand-100"
              />
              <label className="absolute bottom-0 right-0 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center cursor-pointer">
                <Camera size={12} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadProfileImage(e.target.files[0])}
                />
              </label>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg">{profile?.name} PM</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Star size={14} className="text-yellow-500" />
                <span>{profile?.rating}</span>
                <span>·</span>
                <span>{profile?.completed_projects}건 완료</span>
              </div>
            </div>
          </div>

          {editingProfile ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="이름"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                value={profileForm.name || ''}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
              <input
                type="tel"
                placeholder="연락처"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                value={profileForm.phone || ''}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
              <textarea
                placeholder="자기소개"
                className="w-full px-3 py-2 border rounded-lg text-sm resize-none h-16"
                value={profileForm.introduction || ''}
                onChange={(e) => setProfileForm({ ...profileForm, introduction: e.target.value })}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={updateProfile}>
                  <Save size={14} className="mr-1" /> 저장
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingProfile(false)}>
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{profile?.introduction || '자기소개를 입력하세요'}</p>
              <div className="flex flex-wrap gap-1">
                {profile?.specialties?.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-brand-50 text-brand-700 text-xs rounded-full">
                    {s}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setEditingProfile(true)}
                className="text-xs text-brand-600 font-bold hover:underline"
              >
                프로필 수정
              </button>
            </div>
          )}
        </div>

        {/* 프로젝트 목록 */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 bg-gray-50 border-b">
            <h3 className="font-bold text-sm text-gray-700">담당 프로젝트 ({projects.length})</h3>
          </div>
          {projects.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              배정된 프로젝트가 없습니다
            </div>
          ) : (
            <div className="divide-y">
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedProject?.id === project.id ? 'bg-brand-50 border-l-4 border-brand-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{project.business_category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      project.current_step >= 8 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {STEP_LABELS[project.current_step]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    강남구 {project.location_dong} · {project.store_size}평
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 로그아웃 */}
        <div className="p-4 border-t">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 - 프로젝트 상세 & 채팅 */}
      <main className="flex-1 flex flex-col">
        {selectedProject ? (
          <>
            {/* 프로젝트 헤더 */}
            <div className="bg-white border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">
                    {selectedProject.business_category} 창업 프로젝트
                  </h1>
                  <p className="text-sm text-gray-500">
                    강남구 {selectedProject.location_dong} · {selectedProject.store_size}평 ·
                    예상 {(selectedProject.estimated_total / 10000).toFixed(0)}만원
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    selectedProject.current_step >= 8
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {STEP_LABELS[selectedProject.current_step]}
                  </span>
                  {selectedProject.current_step < 9 && (
                    <Button onClick={advanceProjectStep}>
                      <CheckCircle size={18} className="mr-2" />
                      다음 단계 승인
                    </Button>
                  )}
                </div>
              </div>

              {/* 진행 상태 바 */}
              <div className="mt-4 flex gap-1">
                {[7, 8, 9].map(step => (
                  <div
                    key={step}
                    className={`flex-1 h-2 rounded-full ${
                      step <= selectedProject.current_step ? 'bg-brand-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 채팅 영역 */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-3">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === 'PM' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      msg.sender_type === 'PM'
                        ? 'bg-brand-600 text-white rounded-br-md'
                        : msg.sender_type === 'USER'
                          ? 'bg-white border shadow-sm rounded-bl-md'
                          : 'bg-gray-200 text-gray-600 text-sm'
                    }`}
                  >
                    {msg.sender_type === 'USER' && (
                      <p className="text-xs text-gray-400 font-bold mb-1">고객</p>
                    )}
                    <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${
                      msg.sender_type === 'PM' ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {new Date(msg.created_at).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 메시지 입력 */}
            <div className="bg-white border-t p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 px-4 py-3 bg-gray-100 rounded-xl"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                  {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
              <p>프로젝트를 선택하세요</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
