import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Button } from './Components';
import {
  ChevronRight, ChevronLeft, Store, MapPin, Ruler, Wallet,
  Coffee, Utensils, ShoppingBag, Scissors, Dumbbell, GraduationCap,
  Beer, Loader2, CheckCircle, User, Sparkles, Calculator,
  Building, TrendingUp, FileText, Brain, Phone, MessageCircle,
  CreditCard, Rocket, HeartHandshake, Clock, Send, ArrowRight,
  BarChart3, Target, Lightbulb, Shield, Wifi, Wine, Bike, Map,
  BookOpen, Box, Hammer, PaintBucket, SignpostBig, SparklesIcon,
  Check, X, AlertTriangle, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';

interface ServiceJourneyViewProps {
  onBack?: () => void;
}

interface ProjectManager {
  id: string;
  name: string;
  phone: string;
  profile_image: string;
  specialties: string[];
  introduction: string;
  rating: number;
  completed_projects: number;
}

interface Project {
  id: string;
  status: string;
  business_category: string;
  location_dong: string;
  store_size: number;
  estimated_total: number;
  pm_id: string;
  pm?: ProjectManager;
  current_step: number;
}

interface Message {
  id: string;
  sender_type: 'USER' | 'PM' | 'SYSTEM';
  message: string;
  created_at: string;
}

interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: any;
  estimatedCost: { min: number; max: number; unit: string };
  isRequired: boolean;
  status: 'done' | 'worry' | 'unchecked';
}

// 업종 카테고리
const BUSINESS_CATEGORIES = [
  { id: 'cafe', label: '카페/디저트', icon: Coffee, color: 'bg-amber-100 text-amber-700' },
  { id: 'korean', label: '한식', icon: Utensils, color: 'bg-orange-100 text-orange-700' },
  { id: 'chicken', label: '치킨/분식', icon: Utensils, color: 'bg-red-100 text-red-700' },
  { id: 'pub', label: '주점/바', icon: Beer, color: 'bg-purple-100 text-purple-700' },
  { id: 'retail', label: '소매/편의점', icon: ShoppingBag, color: 'bg-blue-100 text-blue-700' },
  { id: 'beauty', label: '미용/뷰티', icon: Scissors, color: 'bg-pink-100 text-pink-700' },
  { id: 'fitness', label: '헬스/운동', icon: Dumbbell, color: 'bg-green-100 text-green-700' },
  { id: 'education', label: '교육/학원', icon: GraduationCap, color: 'bg-indigo-100 text-indigo-700' },
];

// 강남구 동 목록 (주요 랜드마크 포함)
const GANGNAM_DONGS = [
  { name: '역삼동', landmark: '강남역, 강남역 술집거리' },
  { name: '논현동', landmark: '논현역, 학동역' },
  { name: '신사동', landmark: '가로수길, 압구정로데오' },
  { name: '청담동', landmark: '청담동 명품거리' },
  { name: '삼성동', landmark: '코엑스, 봉은사역' },
  { name: '대치동', landmark: '대치동 학원가' },
  { name: '압구정동', landmark: '압구정역, 현대백화점' },
  { name: '도곡동', landmark: '도곡역, 매봉역' },
  { name: '개포동', landmark: '개포동, 대모산' },
  { name: '일원동', landmark: '삼성서울병원' },
];

// 매장 규모
const STORE_SIZES = [
  { id: 'small', label: '소형 (10평 이하)', value: 10 },
  { id: 'medium', label: '중형 (15-20평)', value: 17 },
  { id: 'large', label: '대형 (25평 이상)', value: 30 },
];

// 창업 준비 체크리스트 (강남구 기준 예상 비용 포함)
const STARTUP_CHECKLIST: Omit<ChecklistItem, 'status'>[] = [
  // 공사/정리
  { id: 'demolition', category: '공사/정리', title: '철거 및 원상복구', description: '기존 시설 철거, 폐기물 처리', icon: Hammer, estimatedCost: { min: 50, max: 150, unit: '평당 만원' }, isRequired: true },
  { id: 'interior', category: '공사/정리', title: '인테리어 시공', description: '업종별 맞춤 인테리어', icon: PaintBucket, estimatedCost: { min: 150, max: 400, unit: '평당 만원' }, isRequired: true },
  { id: 'signage', category: '공사/정리', title: '간판/사인물', description: '외부 간판, 내부 사인물', icon: SignpostBig, estimatedCost: { min: 200, max: 800, unit: '만원' }, isRequired: true },
  { id: 'cleaning', category: '공사/정리', title: '전문 청소', description: '준공/입주 딥클리닝', icon: SparklesIcon, estimatedCost: { min: 30, max: 80, unit: '만원' }, isRequired: false },

  // 운영 준비
  { id: 'network', category: '운영 준비', title: '통신 솔루션', description: '인터넷, CCTV, 포스기', icon: Wifi, estimatedCost: { min: 100, max: 300, unit: '만원' }, isRequired: true },
  { id: 'insurance', category: '운영 준비', title: '필수 보험', description: '화재/배상책임 보험', icon: Shield, estimatedCost: { min: 30, max: 100, unit: '연 만원' }, isRequired: true },
  { id: 'beverage', category: '운영 준비', title: '음료/주류 도매', description: '주류사 계약, 음료 납품', icon: Wine, estimatedCost: { min: 0, max: 0, unit: '업체 연결' }, isRequired: false },
  { id: 'delivery', category: '운영 준비', title: '배달 대행', description: '배달권역 세팅, 배민/쿠팡 입점', icon: Bike, estimatedCost: { min: 50, max: 150, unit: '만원' }, isRequired: false },

  // 입지/정보
  { id: 'location', category: '입지/정보', title: '입지 탐색', description: '상권 분석, 매물 적합도 검토', icon: Map, estimatedCost: { min: 0, max: 0, unit: '무료 컨설팅' }, isRequired: true },
  { id: 'permit', category: '입지/정보', title: '인허가/행정 가이드', description: '업종 허가, 영업 신고', icon: BookOpen, estimatedCost: { min: 0, max: 0, unit: '무료 가이드' }, isRequired: true },

  // 오프닝 패키지
  { id: 'furniture', category: '오프닝 패키지', title: '중고 가구/집기', description: 'A급 검수 자재 + 설치', icon: Box, estimatedCost: { min: 500, max: 2000, unit: '만원' }, isRequired: false },
];

// 단계 정의
const JOURNEY_STEPS = [
  { step: 1, title: '업종 선택', description: '어떤 창업을 준비하시나요?' },
  { step: 2, title: '위치 선택', description: '창업 예정 지역을 선택하세요' },
  { step: 3, title: '매장 규모', description: '예상 평수를 입력하세요' },
  { step: 4, title: '준비 체크리스트', description: '현재 상황을 체크해주세요' },
  { step: 5, title: '예상 비용', description: '창업 비용을 확인하세요' },
  { step: 6, title: 'PM 배정', description: '전담 매니저가 배정됩니다' },
];

export const ServiceJourneyView: React.FC<ServiceJourneyViewProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);

  // 폼 데이터
  const [businessCategory, setBusinessCategory] = useState('');
  const [dong, setDong] = useState('');
  const [storeSize, setStoreSize] = useState(15);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    STARTUP_CHECKLIST.map(item => ({ ...item, status: 'unchecked' as const }))
  );
  const [pmMessage, setPmMessage] = useState('');

  // 결과 데이터
  const [estimatedCosts, setEstimatedCosts] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [assignedPM, setAssignedPM] = useState<ProjectManager | null>(null);

  // 채팅
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 기존 프로젝트 로드
  useEffect(() => {
    loadExistingProject();
  }, []);

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 비용 계산
  useEffect(() => {
    calculateCosts();
  }, [checklist, storeSize]);

  const loadExistingProject = async () => {
    setLoading(true);

    const { data: projects } = await supabase
      .from('startup_projects')
      .select(`
        *,
        pm:project_managers(*)
      `)
      .in('status', ['DRAFT', 'PM_ASSIGNED', 'IN_PROGRESS', 'PAYMENT_PENDING', 'ACTIVE', 'POST_SERVICE'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (projects && projects.length > 0) {
      const proj = projects[0];
      setProject(proj);
      setCurrentStep(proj.current_step || 6);
      setBusinessCategory(proj.business_category);
      setDong(proj.location_dong);
      setStoreSize(proj.store_size);
      setEstimatedCosts({ min: proj.estimated_total * 0.8, max: proj.estimated_total * 1.2 });

      if (proj.pm) {
        setAssignedPM(proj.pm);
      }

      loadMessages(proj.id);
      subscribeToMessages(proj.id);
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
    supabase
      .channel(`project-${projectId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'project_messages',
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !project) return;

    setSending(true);
    await supabase.from('project_messages').insert({
      project_id: project.id,
      sender_type: 'USER',
      message: newMessage.trim()
    });

    setNewMessage('');
    setSending(false);
  };

  const formatPrice = (price: number) => {
    if (price >= 10000) {
      return `${(price / 10000).toFixed(0)}억`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(1)}천만`;
    }
    return `${price}만`;
  };

  const calculateCosts = () => {
    let minTotal = 0;
    let maxTotal = 0;

    checklist.forEach(item => {
      if (item.status !== 'done') {
        const isPerPyung = item.estimatedCost.unit.includes('평당');
        const multiplier = isPerPyung ? storeSize : 1;
        minTotal += item.estimatedCost.min * multiplier;
        maxTotal += item.estimatedCost.max * multiplier;
      }
    });

    // 기본 비용 추가 (보증금, 권리금 예상)
    const depositMin = storeSize * 300; // 평당 300만원
    const depositMax = storeSize * 800; // 평당 800만원
    minTotal += depositMin;
    maxTotal += depositMax;

    setEstimatedCosts({ min: minTotal, max: maxTotal });
  };

  const toggleChecklistItem = (itemId: string, newStatus: 'done' | 'worry' | 'unchecked') => {
    setChecklist(prev => prev.map(item =>
      item.id === itemId ? { ...item, status: newStatus } : item
    ));
  };

  // PM 배정
  const assignPM = async () => {
    const { data: pms } = await supabase
      .from('project_managers')
      .select('*')
      .eq('is_available', true);

    if (pms && pms.length > 0) {
      const randomPM = pms[Math.floor(Math.random() * pms.length)];
      setAssignedPM(randomPM);
      return randomPM;
    }
    return null;
  };

  // 프로젝트 생성
  const createProject = async () => {
    setLoading(true);
    const pm = await assignPM();

    const worryItems = checklist.filter(i => i.status === 'worry').map(i => i.title);
    const doneItems = checklist.filter(i => i.status === 'done').map(i => i.title);

    const { data: newProject } = await supabase
      .from('startup_projects')
      .insert([{
        business_category: businessCategory,
        location_city: '서울시',
        location_district: '강남구',
        location_dong: dong,
        store_size: storeSize,
        estimated_total: (estimatedCosts.min + estimatedCosts.max) / 2,
        current_step: 6,
        status: 'PM_ASSIGNED',
        pm_id: pm?.id
      }])
      .select()
      .single();

    if (newProject && pm) {
      setProject(newProject);

      // 초기 메시지 전송
      const category = BUSINESS_CATEGORIES.find(c => c.id === businessCategory);
      let systemMsg = `📋 프로젝트 요약\n\n`;
      systemMsg += `• 업종: ${category?.label}\n`;
      systemMsg += `• 위치: 강남구 ${dong}\n`;
      systemMsg += `• 규모: ${storeSize}평\n`;
      systemMsg += `• 예상 비용: ${formatPrice(estimatedCosts.min)} ~ ${formatPrice(estimatedCosts.max)}원\n\n`;

      if (doneItems.length > 0) {
        systemMsg += `✅ 이미 준비됨: ${doneItems.join(', ')}\n`;
      }
      if (worryItems.length > 0) {
        systemMsg += `⚠️ 도움 필요: ${worryItems.join(', ')}\n`;
      }

      await supabase.from('project_messages').insert({
        project_id: newProject.id,
        sender_type: 'SYSTEM',
        message: systemMsg
      });

      // 사용자 메시지
      if (pmMessage.trim()) {
        await supabase.from('project_messages').insert({
          project_id: newProject.id,
          sender_type: 'USER',
          message: pmMessage.trim()
        });
      }

      // PM 환영 메시지
      await supabase.from('project_messages').insert({
        project_id: newProject.id,
        sender_type: 'PM',
        message: `안녕하세요! 담당 PM ${pm.name}입니다 😊\n\n강남구 ${dong} ${category?.label} 창업을 함께 하게 되어 반갑습니다.\n\n${worryItems.length > 0 ? `말씀하신 ${worryItems[0]} 관련해서 제가 자세히 안내드릴게요.\n\n` : ''}곧 전화드리겠습니다!`
      });

      loadMessages(newProject.id);
      subscribeToMessages(newProject.id);
      setCurrentStep(6);
    }
    setLoading(false);
  };

  const goToNextStep = () => {
    if (currentStep === 5) {
      createProject();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const goToPrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return businessCategory !== '';
      case 2: return dong !== '';
      case 3: return storeSize > 0;
      case 4: return true;
      case 5: return true;
      default: return true;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-brand-600 mx-auto mb-4" size={40} />
          <p className="text-gray-500">프로젝트 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // PM 배정 후 화면 (Step 6+)
  if (currentStep >= 6 && assignedPM) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* 깔끔한 헤더 */}
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/favicon-new.png" alt="오프닝" className="w-10 h-10 rounded-xl" />
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg text-slate-900 truncate">내 창업 프로젝트</h1>
              <p className="text-xs text-gray-500">
                강남구 {dong} · {BUSINESS_CATEGORIES.find(c => c.id === businessCategory)?.label} · {storeSize}평
              </p>
            </div>
          </div>
        </div>

        {/* PM 카드 */}
        <div className="p-4">
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <div className="flex items-center gap-4">
              <img
                src={assignedPM.profile_image || '/favicon-new.png'}
                alt={assignedPM.name}
                className="w-16 h-16 rounded-full border-2 border-brand-100 object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg">{assignedPM.name}</span>
                  <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-bold">담당 PM</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  ⭐ {assignedPM.rating} · 프로젝트 {assignedPM.completed_projects}건 완료
                </p>
                <div className="flex flex-wrap gap-1">
                  {assignedPM.specialties?.slice(0, 3).map((s, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <a
                href={`tel:${assignedPM.phone}`}
                className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg"
              >
                <Phone size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* 예상 비용 요약 */}
        <div className="px-4 mb-2">
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-100 mb-1">예상 창업 비용</p>
                <p className="text-2xl font-bold">
                  {formatPrice(estimatedCosts.min)} ~ {formatPrice(estimatedCosts.max)}원
                </p>
              </div>
              <Calculator size={32} className="text-white/30" />
            </div>
          </div>
        </div>

        {/* 채팅 영역 */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <MessageCircle size={40} className="mx-auto mb-2 opacity-50" />
              <p>PM에게 메시지를 보내보세요</p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_type === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.sender_type === 'USER'
                      ? 'bg-brand-600 text-white rounded-br-md'
                      : msg.sender_type === 'PM'
                        ? 'bg-white border shadow-sm rounded-bl-md'
                        : 'bg-gray-100 text-gray-600 text-sm'
                  }`}
                >
                  {msg.sender_type === 'PM' && (
                    <p className="text-xs text-brand-600 font-bold mb-1">{assignedPM?.name} PM</p>
                  )}
                  {msg.sender_type === 'SYSTEM' && (
                    <p className="text-xs text-gray-400 font-bold mb-1">시스템</p>
                  )}
                  <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                  <p className={`text-[10px] mt-1 ${
                    msg.sender_type === 'USER' ? 'text-white/70' : 'text-gray-400'
                  }`}>
                    {new Date(msg.created_at).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 메시지 입력 */}
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="메시지를 입력하세요"
              className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50"
            >
              {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 온보딩 단계 (1-5)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 프로그레스 헤더 */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="flex items-center justify-between px-4 h-14">
          {currentStep > 1 ? (
            <button onClick={goToPrevStep} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft size={24} />
            </button>
          ) : (
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          )}
          <div className="flex-1 mx-4">
            <div className="flex gap-1">
              {JOURNEY_STEPS.map(s => (
                <div
                  key={s.step}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    s.step <= currentStep ? 'bg-brand-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="text-sm font-bold text-gray-400">{currentStep}/{JOURNEY_STEPS.length}</div>
        </div>
        <div className="px-4 pb-3">
          <h2 className="text-lg font-bold text-slate-900">{JOURNEY_STEPS[currentStep - 1]?.title}</h2>
          <p className="text-sm text-gray-500">{JOURNEY_STEPS[currentStep - 1]?.description}</p>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 p-4 pb-32 overflow-y-auto">
        {/* Step 1: 업종 선택 */}
        {currentStep === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {BUSINESS_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = businessCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setBusinessCategory(cat.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center mx-auto mb-3`}>
                    <Icon size={24} />
                  </div>
                  <p className={`font-bold text-sm ${isSelected ? 'text-brand-700' : 'text-gray-700'}`}>
                    {cat.label}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: 위치 선택 */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
              <div className="flex items-center gap-2 text-brand-700 mb-1">
                <MapPin size={18} />
                <span className="font-bold">서울시 강남구</span>
              </div>
              <p className="text-sm text-brand-600">현재 강남구에서만 서비스 이용 가능</p>
            </div>

            <div className="space-y-2">
              {GANGNAM_DONGS.map(d => (
                <button
                  key={d.name}
                  onClick={() => setDong(d.name)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    dong === d.name
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-bold ${dong === d.name ? 'text-brand-700' : 'text-gray-900'}`}>
                        {d.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{d.landmark}</p>
                    </div>
                    {dong === d.name && <CheckCircle size={20} className="text-brand-600" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: 규모 선택 */}
        {currentStep === 3 && (
          <div className="space-y-4">
            {STORE_SIZES.map(size => (
              <button
                key={size.id}
                onClick={() => setStoreSize(size.value)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  storeSize === size.value
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{size.label}</span>
                  {storeSize === size.value && <CheckCircle size={20} className="text-brand-600" />}
                </div>
              </button>
            ))}

            <div className="pt-4">
              <label className="text-sm font-bold text-gray-500 mb-2 block">직접 입력 (평)</label>
              <input
                type="number"
                placeholder="예: 15"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg font-bold focus:border-brand-500 focus:ring-0"
                value={storeSize}
                onChange={(e) => setStoreSize(Number(e.target.value) || 15)}
              />
            </div>
          </div>
        )}

        {/* Step 4: 체크리스트 */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
              <p className="font-bold mb-1">💡 현재 상황을 체크해주세요</p>
              <p className="text-yellow-700">이미 해결된 항목은 ✓, 걱정되는 항목은 ⚠️ 를 눌러주세요</p>
            </div>

            {['공사/정리', '운영 준비', '입지/정보', '오프닝 패키지'].map(category => (
              <div key={category} className="bg-white rounded-xl border overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h3 className="font-bold text-sm text-gray-700">{category}</h3>
                </div>
                <div className="divide-y">
                  {checklist.filter(item => item.category === category).map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id} className="p-3 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          item.status === 'done' ? 'bg-green-100 text-green-600' :
                          item.status === 'worry' ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleChecklistItem(item.id, item.status === 'done' ? 'unchecked' : 'done')}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center border-2 transition-all ${
                              item.status === 'done'
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-200 text-gray-400 hover:border-green-300'
                            }`}
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => toggleChecklistItem(item.id, item.status === 'worry' ? 'unchecked' : 'worry')}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center border-2 transition-all ${
                              item.status === 'worry'
                                ? 'bg-orange-500 border-orange-500 text-white'
                                : 'border-gray-200 text-gray-400 hover:border-orange-300'
                            }`}
                          >
                            <AlertTriangle size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 5: 비용 산출 & PM 메시지 */}
        {currentStep === 5 && (
          <div className="space-y-4">
            {/* 비용 요약 */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Calculator size={20} />
                <span className="font-bold">예상 총 창업 비용</span>
              </div>
              <div className="text-3xl font-black mb-2">
                {formatPrice(estimatedCosts.min)} ~ {formatPrice(estimatedCosts.max)}원
              </div>
              <p className="text-sm text-brand-100">보증금, 권리금, 시설비 포함</p>
            </div>

            {/* 비용 상세 */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h3 className="font-bold text-sm text-gray-700">비용 상세 (강남구 {dong} 기준)</h3>
              </div>
              <div className="divide-y">
                <div className="p-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">보증금 + 권리금 (예상)</span>
                  <span className="font-bold text-sm">{formatPrice(storeSize * 300)} ~ {formatPrice(storeSize * 800)}원</span>
                </div>
                {checklist.filter(i => i.status !== 'done' && i.estimatedCost.max > 0).map(item => {
                  const isPerPyung = item.estimatedCost.unit.includes('평당');
                  const min = item.estimatedCost.min * (isPerPyung ? storeSize : 1);
                  const max = item.estimatedCost.max * (isPerPyung ? storeSize : 1);
                  return (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{item.title}</span>
                        {item.status === 'worry' && (
                          <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">걱정</span>
                        )}
                      </div>
                      <span className="font-bold text-sm">
                        {min > 0 ? `${formatPrice(min)} ~ ${formatPrice(max)}원` : '무료'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PM에게 전할 메시지 */}
            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-bold text-sm text-gray-700 mb-2">💬 PM에게 전할 말이 있나요?</h3>
              <textarea
                placeholder="궁금한 점이나 요청사항을 적어주세요..."
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm resize-none h-24"
                value={pmMessage}
                onChange={(e) => setPmMessage(e.target.value)}
              />
            </div>

            {/* 걱정 항목 요약 */}
            {checklist.filter(i => i.status === 'worry').length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <h3 className="font-bold text-sm text-orange-800 mb-2">⚠️ PM이 중점 지원할 항목</h3>
                <div className="flex flex-wrap gap-2">
                  {checklist.filter(i => i.status === 'worry').map(item => (
                    <span key={item.id} className="px-3 py-1 bg-white text-orange-700 rounded-full text-sm font-medium border border-orange-200">
                      {item.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <Button
          fullWidth
          size="lg"
          disabled={!canProceed() || loading}
          onClick={goToNextStep}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : currentStep === 5 ? (
            <>
              <Rocket size={20} className="mr-2" />
              PM 배정받기
            </>
          ) : (
            <>
              다음
              <ChevronRight size={20} className="ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
