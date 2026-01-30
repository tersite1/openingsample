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
  Check, X, AlertTriangle, HelpCircle, ChevronDown, ChevronUp,
  Wind, Flame, ChefHat, Package, Monitor, Truck, Refrigerator, Armchair,
  Users, TrendingDown, Navigation, MapPinned, CircleDollarSign, Eye
} from 'lucide-react';

interface ServiceJourneyViewProps {
  onBack?: () => void;
  isGuestMode?: boolean;
}

interface ProjectManager {
  id: string;
  name: string;
  phone: string;
  profile_image: string;
  specialties: string[];
  introduction: string;
  greeting_message?: string;
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

// 업종별 체크리스트 데이터
const CHECKLIST_BY_CATEGORY: Record<string, Omit<ChecklistItem, 'status'>[]> = {
  // 치킨/분식 전용
  chicken: [
    // 인허가/행정
    { id: 'business_registration', category: '인허가/행정', title: '사업자등록', description: '세무서 사업자등록 신청', icon: FileText, estimatedCost: { min: 0, max: 0, unit: '무료' }, isRequired: true },
    { id: 'food_license', category: '인허가/행정', title: '음식점 영업신고', description: '구청 위생과 영업신고', icon: BookOpen, estimatedCost: { min: 0, max: 5, unit: '만원' }, isRequired: true },
    { id: 'hygiene_edu', category: '인허가/행정', title: '위생교육 이수', description: '한국외식업중앙회 위생교육 (3시간)', icon: GraduationCap, estimatedCost: { min: 2, max: 4, unit: '만원' }, isRequired: true },

    // 시설/공사
    { id: 'demolition', category: '시설/공사', title: '철거 및 원상복구', description: '기존 시설 철거, 폐기물 처리', icon: Hammer, estimatedCost: { min: 50, max: 150, unit: '평당 만원' }, isRequired: true },
    { id: 'interior', category: '시설/공사', title: '인테리어 시공', description: '주방/홀 인테리어, 타일, 조명', icon: PaintBucket, estimatedCost: { min: 150, max: 350, unit: '평당 만원' }, isRequired: true },
    { id: 'ventilation', category: '시설/공사', title: '주방 환기/후드 시스템', description: '튀김 연기 배출 필수 (치킨집 핵심)', icon: Wind, estimatedCost: { min: 300, max: 800, unit: '만원' }, isRequired: true },
    { id: 'signage', category: '시설/공사', title: '간판/사인물', description: '외부 간판, 메뉴판, 가격표', icon: SignpostBig, estimatedCost: { min: 200, max: 600, unit: '만원' }, isRequired: true },
    { id: 'gas_work', category: '시설/공사', title: '가스 배관 공사', description: '업소용 가스 용량 증설', icon: Flame, estimatedCost: { min: 100, max: 300, unit: '만원' }, isRequired: true },

    // 주방 장비
    { id: 'fryer', category: '주방 장비', title: '업소용 튀김기', description: '전기/가스 튀김기 2~3구', icon: ChefHat, estimatedCost: { min: 200, max: 500, unit: '만원' }, isRequired: true },
    { id: 'refrigerator', category: '주방 장비', title: '업소용 냉장/냉동고', description: '원재료 보관용 대용량', icon: Refrigerator, estimatedCost: { min: 150, max: 400, unit: '만원' }, isRequired: true },
    { id: 'prep_table', category: '주방 장비', title: '작업대/싱크대', description: '스텐 작업대, 3조 싱크대', icon: Box, estimatedCost: { min: 100, max: 250, unit: '만원' }, isRequired: true },
    { id: 'packaging', category: '주방 장비', title: '포장 용기/봉투', description: '치킨박스, 봉투, 소스용기 등', icon: Package, estimatedCost: { min: 30, max: 100, unit: '만원 (초도물량)' }, isRequired: true },

    // 운영 준비
    { id: 'pos_system', category: '운영 준비', title: 'POS/주문 시스템', description: '포스기, 주문접수 태블릿', icon: Monitor, estimatedCost: { min: 50, max: 150, unit: '만원' }, isRequired: true },
    { id: 'delivery_app', category: '운영 준비', title: '배달앱 입점', description: '배민, 쿠팡이츠, 요기요 등록', icon: Bike, estimatedCost: { min: 0, max: 50, unit: '만원 (광고비 별도)' }, isRequired: true },
    { id: 'delivery_agency', category: '운영 준비', title: '배달대행 계약', description: '배달권역 설정, 대행사 계약', icon: Truck, estimatedCost: { min: 0, max: 0, unit: '건당 과금' }, isRequired: true },
    { id: 'supplier', category: '운영 준비', title: '원재료 공급처', description: '닭, 튀김가루, 소스 등 계약', icon: Store, estimatedCost: { min: 0, max: 0, unit: '업체 연결' }, isRequired: true },
    { id: 'cctv_internet', category: '운영 준비', title: 'CCTV/인터넷', description: '매장 보안, 배달앱 연동용', icon: Wifi, estimatedCost: { min: 50, max: 150, unit: '만원' }, isRequired: true },
    { id: 'insurance', category: '운영 준비', title: '영업배상책임보험', description: '음식점 필수 가입', icon: Shield, estimatedCost: { min: 20, max: 50, unit: '연 만원' }, isRequired: true },
  ],

  // 카페 전용
  cafe: [
    { id: 'business_registration', category: '인허가/행정', title: '사업자등록', description: '세무서 사업자등록 신청', icon: FileText, estimatedCost: { min: 0, max: 0, unit: '무료' }, isRequired: true },
    { id: 'food_license', category: '인허가/행정', title: '휴게음식점 영업신고', description: '구청 위생과 신고', icon: BookOpen, estimatedCost: { min: 0, max: 5, unit: '만원' }, isRequired: true },
    { id: 'hygiene_edu', category: '인허가/행정', title: '위생교육 이수', description: '한국외식업중앙회 위생교육', icon: GraduationCap, estimatedCost: { min: 2, max: 4, unit: '만원' }, isRequired: true },
    { id: 'demolition', category: '시설/공사', title: '철거 및 원상복구', description: '기존 시설 철거', icon: Hammer, estimatedCost: { min: 50, max: 150, unit: '평당 만원' }, isRequired: true },
    { id: 'interior', category: '시설/공사', title: '인테리어 시공', description: '카페 컨셉 인테리어', icon: PaintBucket, estimatedCost: { min: 200, max: 500, unit: '평당 만원' }, isRequired: true },
    { id: 'signage', category: '시설/공사', title: '간판/사인물', description: '외부 간판, 메뉴보드', icon: SignpostBig, estimatedCost: { min: 200, max: 800, unit: '만원' }, isRequired: true },
    { id: 'espresso_machine', category: '장비', title: '에스프레소 머신', description: '2그룹 이상 반자동/자동', icon: Coffee, estimatedCost: { min: 500, max: 3000, unit: '만원' }, isRequired: true },
    { id: 'grinder', category: '장비', title: '커피 그라인더', description: '온디맨드 그라인더', icon: Coffee, estimatedCost: { min: 100, max: 500, unit: '만원' }, isRequired: true },
    { id: 'refrigerator', category: '장비', title: '냉장고/제빙기', description: '쇼케이스, 제빙기', icon: Refrigerator, estimatedCost: { min: 200, max: 500, unit: '만원' }, isRequired: true },
    { id: 'furniture', category: '장비', title: '테이블/의자', description: '홀 가구', icon: Armchair, estimatedCost: { min: 200, max: 800, unit: '만원' }, isRequired: true },
    { id: 'pos_system', category: '운영 준비', title: 'POS 시스템', description: '포스기, 카드단말기', icon: Monitor, estimatedCost: { min: 50, max: 150, unit: '만원' }, isRequired: true },
    { id: 'supplier', category: '운영 준비', title: '원두/부자재 공급', description: '원두, 우유, 시럽 등', icon: Store, estimatedCost: { min: 0, max: 0, unit: '업체 연결' }, isRequired: true },
    { id: 'insurance', category: '운영 준비', title: '영업배상책임보험', description: '필수 가입', icon: Shield, estimatedCost: { min: 20, max: 50, unit: '연 만원' }, isRequired: true },
  ],

  // 기본 (그 외 업종)
  default: [
    { id: 'business_registration', category: '인허가/행정', title: '사업자등록', description: '세무서 사업자등록', icon: FileText, estimatedCost: { min: 0, max: 0, unit: '무료' }, isRequired: true },
    { id: 'license', category: '인허가/행정', title: '영업허가/신고', description: '업종별 인허가', icon: BookOpen, estimatedCost: { min: 0, max: 10, unit: '만원' }, isRequired: true },
    { id: 'demolition', category: '시설/공사', title: '철거 및 원상복구', description: '기존 시설 철거', icon: Hammer, estimatedCost: { min: 50, max: 150, unit: '평당 만원' }, isRequired: true },
    { id: 'interior', category: '시설/공사', title: '인테리어 시공', description: '업종별 맞춤 인테리어', icon: PaintBucket, estimatedCost: { min: 150, max: 400, unit: '평당 만원' }, isRequired: true },
    { id: 'signage', category: '시설/공사', title: '간판/사인물', description: '외부 간판, 내부 사인물', icon: SignpostBig, estimatedCost: { min: 200, max: 800, unit: '만원' }, isRequired: true },
    { id: 'equipment', category: '장비', title: '업종별 장비', description: '필수 장비/집기', icon: Box, estimatedCost: { min: 500, max: 2000, unit: '만원' }, isRequired: true },
    { id: 'pos_system', category: '운영 준비', title: 'POS/결제 시스템', description: '포스기, 카드단말기', icon: Monitor, estimatedCost: { min: 50, max: 150, unit: '만원' }, isRequired: true },
    { id: 'cctv_internet', category: '운영 준비', title: 'CCTV/인터넷', description: '매장 보안, 통신', icon: Wifi, estimatedCost: { min: 50, max: 150, unit: '만원' }, isRequired: true },
    { id: 'insurance', category: '운영 준비', title: '필수 보험', description: '화재/배상책임 보험', icon: Shield, estimatedCost: { min: 30, max: 100, unit: '연 만원' }, isRequired: true },
  ],
};

// 업종 ID -> 체크리스트 매핑
const getChecklistForCategory = (categoryId: string): Omit<ChecklistItem, 'status'>[] => {
  if (categoryId === 'chicken') return CHECKLIST_BY_CATEGORY.chicken;
  if (categoryId === 'cafe') return CHECKLIST_BY_CATEGORY.cafe;
  return CHECKLIST_BY_CATEGORY.default;
};

// 동별 상권 정보
const DONG_INFO: Record<string, { competitors: number; footTraffic: string; avgRent: number; description: string }> = {
  '역삼동': { competitors: 45, footTraffic: '일 평균 85,000명', avgRent: 350, description: '강남역 상권, 술집거리 밀집, 야간 유동인구 높음' },
  '논현동': { competitors: 28, footTraffic: '일 평균 42,000명', avgRent: 280, description: '학동사거리 중심, 주거+상업 복합' },
  '신사동': { competitors: 35, footTraffic: '일 평균 55,000명', avgRent: 400, description: '가로수길 상권, 젊은층 유동인구' },
  '청담동': { competitors: 18, footTraffic: '일 평균 25,000명', avgRent: 500, description: '고급 상권, 배달보다 매장 중심' },
  '삼성동': { competitors: 32, footTraffic: '일 평균 70,000명', avgRent: 380, description: '코엑스 상권, 직장인 중심' },
  '대치동': { competitors: 22, footTraffic: '일 평균 35,000명', avgRent: 250, description: '학원가 상권, 저녁 시간대 집중' },
  '압구정동': { competitors: 25, footTraffic: '일 평균 40,000명', avgRent: 420, description: '로데오거리, 젊은층+고소득층' },
  '도곡동': { competitors: 15, footTraffic: '일 평균 20,000명', avgRent: 200, description: '주거 중심, 배달 수요 높음' },
  '개포동': { competitors: 12, footTraffic: '일 평균 15,000명', avgRent: 180, description: '재건축 진행중, 배달 위주' },
  '일원동': { competitors: 10, footTraffic: '일 평균 18,000명', avgRent: 170, description: '병원 상권, 안정적 수요' },
};

// 단계 정의
const JOURNEY_STEPS = [
  { step: 1, title: '업종 선택', description: '어떤 창업을 준비하시나요?' },
  { step: 2, title: '위치 선택', description: '창업 예정 지역을 선택하세요' },
  { step: 3, title: '상권 분석', description: '선택한 지역의 상권을 분석합니다' },
  { step: 4, title: '매장 규모', description: '예상 평수를 입력하세요' },
  { step: 5, title: '준비 체크리스트', description: '현재 상황을 체크해주세요' },
  { step: 6, title: '예상 비용', description: '창업 비용을 확인하세요' },
  { step: 7, title: 'PM 배정', description: '전담 매니저가 배정됩니다' },
];

// 동별 카카오맵 좌표
const DONG_COORDINATES: Record<string, { lat: number; lng: number }> = {
  '역삼동': { lat: 37.5007, lng: 127.0365 },
  '논현동': { lat: 37.5112, lng: 127.0288 },
  '신사동': { lat: 37.5239, lng: 127.0237 },
  '청담동': { lat: 37.5247, lng: 127.0473 },
  '삼성동': { lat: 37.5088, lng: 127.0628 },
  '대치동': { lat: 37.4946, lng: 127.0576 },
  '압구정동': { lat: 37.5273, lng: 127.0284 },
  '도곡동': { lat: 37.4889, lng: 127.0463 },
  '개포동': { lat: 37.4774, lng: 127.0521 },
  '일원동': { lat: 37.4836, lng: 127.0856 },
};

export const ServiceJourneyView: React.FC<ServiceJourneyViewProps> = ({ onBack, isGuestMode = false }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(!isGuestMode); // 게스트 모드는 로딩 없음
  const [project, setProject] = useState<Project | null>(null);

  // 폼 데이터
  const [businessCategory, setBusinessCategory] = useState('');
  const [dong, setDong] = useState('');
  const [storeSize, setStoreSize] = useState(15);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [pmMessage, setPmMessage] = useState('');

  // 업종 선택 시 체크리스트 초기화
  useEffect(() => {
    if (businessCategory) {
      const items = getChecklistForCategory(businessCategory);
      setChecklist(items.map(item => ({ ...item, status: 'unchecked' as const })));
    }
  }, [businessCategory]);

  // 결과 데이터
  const [estimatedCosts, setEstimatedCosts] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [assignedPM, setAssignedPM] = useState<ProjectManager | null>(null);

  // 채팅
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // UI 상태
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);

  // 기존 프로젝트 로드 (게스트 모드가 아닐 때만)
  useEffect(() => {
    if (!isGuestMode) {
      loadExistingProject();
    }
  }, [isGuestMode]);

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
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setSending(true);

    // 게스트 모드: 로컬 상태로만 처리
    if (isGuestMode) {
      const guestMessage: Message = {
        id: `guest-msg-${Date.now()}`,
        sender_type: 'USER',
        message: messageText,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, guestMessage]);

      // 게스트 모드에서 PM 자동 응답 시뮬레이션
      setTimeout(() => {
        const pmResponse: Message = {
          id: `guest-pm-${Date.now()}`,
          sender_type: 'PM',
          message: '안녕하세요! 게스트 모드에서는 메시지 기능을 체험해보실 수 있습니다. 실제 PM과 상담을 원하시면 회원가입 후 이용해주세요 😊',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, pmResponse]);
      }, 1000);

      setNewMessage('');
      setSending(false);
      return;
    }

    // 실제 사용자: DB에 저장
    if (!project?.id) {
      setSending(false);
      return;
    }

    try {
      const { data, error } = await supabase.from('project_messages').insert({
        project_id: project.id,
        sender_type: 'USER',
        message: messageText
      }).select().single();

      if (error) {
        console.error('메시지 전송 오류:', error);
        // 에러가 있어도 UI에 메시지를 즉시 표시 (낙관적 업데이트)
        const tempMessage: Message = {
          id: `temp-${Date.now()}`,
          sender_type: 'USER',
          message: messageText,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMessage]);
      } else if (data) {
        // Realtime이 작동하지 않을 경우를 대비해 직접 추가
        setMessages(prev => {
          const exists = prev.some(m => m.id === data.id);
          if (exists) return prev;
          return [...prev, data];
        });
      }
    } catch (err) {
      console.error('메시지 전송 실패:', err);
    }

    setNewMessage('');
    setSending(false);
  };

  // 프로젝트 취소
  const cancelProject = async () => {
    // 게스트 모드: 로컬 상태만 초기화
    if (isGuestMode) {
      setProject(null);
      setAssignedPM(null);
      setCurrentStep(1);
      setBusinessCategory('');
      setDong('');
      setStoreSize(15);
      setChecklist([]);
      setMessages([]);
      setShowCancelDialog(false);
      if (onBack) onBack();
      return;
    }

    // 실제 사용자: DB 업데이트
    if (!project?.id) return;

    try {
      await supabase
        .from('startup_projects')
        .update({ status: 'CANCELLED' })
        .eq('id', project.id);

      setProject(null);
      setAssignedPM(null);
      setCurrentStep(1);
      setBusinessCategory('');
      setDong('');
      setStoreSize(15);
      setChecklist([]);
      setMessages([]);
      setShowCancelDialog(false);
    } catch (err) {
      console.error('프로젝트 취소 실패:', err);
    }
  };

  // 온보딩 애니메이션 시작
  const startOnboarding = () => {
    setShowOnboarding(true);
    setOnboardingStep(0);
  };

  // 온보딩 완료 후 실제 시작
  const completeOnboarding = () => {
    setShowOnboarding(false);
    setCurrentStep(1);
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

    const worryItems = checklist.filter(i => i.status === 'worry').map(i => i.title);
    const doneItems = checklist.filter(i => i.status === 'done').map(i => i.title);
    const category = BUSINESS_CATEGORIES.find(c => c.id === businessCategory);

    // 게스트 모드: 로컬 상태로만 처리 (실제 PM 배정)
    if (isGuestMode) {
      // 실제 PM 목록에서 랜덤 배정
      const { data: realPMs } = await supabase
        .from('project_managers')
        .select('*')
        .eq('is_available', true);

      let guestPM: ProjectManager;
      if (realPMs && realPMs.length > 0) {
        // 랜덤으로 PM 선택
        const randomPM = realPMs[Math.floor(Math.random() * realPMs.length)];
        guestPM = {
          id: randomPM.id,
          name: randomPM.name,
          phone: randomPM.phone || '010-0000-0000',
          profile_image: randomPM.profile_image || '/favicon-new.png',
          specialties: randomPM.specialties || [],
          introduction: randomPM.introduction || '강남구 전문 PM입니다.',
          greeting_message: randomPM.greeting_message || '안녕하세요! 담당 PM입니다. 창업 준비를 함께 도와드리겠습니다.',
          rating: randomPM.rating || 5.0,
          completed_projects: randomPM.completed_projects || 0
        };
      } else {
        // PM이 없으면 기본값 사용
        guestPM = {
          id: 'default-pm',
          name: '오프닝 PM',
          phone: '02-1234-5678',
          profile_image: '/favicon-new.png',
          specialties: ['카페', '음식점', '소매'],
          introduction: '강남구 전문 PM입니다.',
          greeting_message: '안녕하세요! 담당 PM입니다. 창업 준비를 함께 도와드리겠습니다.',
          rating: 5.0,
          completed_projects: 0
        };
      }
      setAssignedPM(guestPM);

      // 로컬 프로젝트 생성
      const guestProject: Project = {
        id: `guest-project-${Date.now()}`,
        status: 'PM_ASSIGNED',
        business_category: businessCategory,
        location_dong: dong,
        store_size: storeSize,
        estimated_total: (estimatedCosts.min + estimatedCosts.max) / 2,
        pm_id: guestPM.id,
        pm: guestPM,
        current_step: 7
      };
      setProject(guestProject);

      // 로컬 메시지 생성
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

      const pmGreeting = guestPM.greeting_message || guestPM.introduction || '강남구 창업 전문 PM입니다.';
      const guestMessages: Message[] = [
        {
          id: 'guest-sys-1',
          sender_type: 'SYSTEM',
          message: systemMsg,
          created_at: new Date().toISOString()
        },
        {
          id: 'guest-pm-welcome',
          sender_type: 'PM',
          message: `안녕하세요! 담당 PM ${guestPM.name}입니다 😊\n\n${pmGreeting}\n\n강남구 ${dong} ${category?.label} 창업을 함께 하게 되어 반갑습니다.\n\n${worryItems.length > 0 ? `말씀하신 ${worryItems[0]} 관련해서 제가 자세히 안내드릴게요.\n\n` : ''}이것은 게스트 모드 체험입니다. 실제 PM 상담을 원하시면 회원가입 후 이용해주세요!`,
          created_at: new Date().toISOString()
        }
      ];

      if (pmMessage.trim()) {
        guestMessages.splice(1, 0, {
          id: 'guest-user-1',
          sender_type: 'USER',
          message: pmMessage.trim(),
          created_at: new Date().toISOString()
        });
      }

      setMessages(guestMessages);
      setCurrentStep(7);
      setLoading(false);
      return;
    }

    // 실제 사용자: DB에 저장
    const pm = await assignPM();

    // 체크리스트 데이터 준비
    const checklistData = checklist.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      status: item.status
    }));

    const { data: newProject } = await supabase
      .from('startup_projects')
      .insert([{
        business_category: businessCategory,
        location_city: '서울시',
        location_district: '강남구',
        location_dong: dong,
        store_size: storeSize,
        estimated_total: (estimatedCosts.min + estimatedCosts.max) / 2,
        current_step: 7,
        status: 'PM_ASSIGNED',
        pm_id: pm?.id,
        checklist_data: checklistData
      }])
      .select()
      .single();

    if (newProject && pm) {
      setProject(newProject);

      // 초기 메시지 전송
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

      // PM 환영 메시지 (PM 개인 인사 메시지 사용)
      const pmGreetingMsg = pm.greeting_message || '안녕하세요! 담당 PM입니다. 창업 준비를 함께 도와드리겠습니다.';
      await supabase.from('project_messages').insert({
        project_id: newProject.id,
        sender_type: 'PM',
        message: `안녕하세요! 담당 PM ${pm.name}입니다 😊\n\n${pmGreetingMsg}\n\n강남구 ${dong} ${category?.label} 창업을 함께 하게 되어 반갑습니다.\n\n${worryItems.length > 0 ? `말씀하신 ${worryItems[0]} 관련해서 제가 자세히 안내드릴게요.\n\n` : ''}곧 전화드리겠습니다!`
      });

      loadMessages(newProject.id);
      subscribeToMessages(newProject.id);
      setCurrentStep(7);
    }
    setLoading(false);
  };

  const goToNextStep = () => {
    if (currentStep === 6) {
      createProject(); // createProject에서 currentStep을 7로 설정함
    } else {
      setCurrentStep(prev => Math.min(prev + 1, 6)); // 6까지만 버튼으로 이동, 7은 createProject에서
    }
  };

  const goToPrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return businessCategory !== '';
      case 2: return dong !== '';
      case 3: return true; // 상권 분석 보기만 하면 됨
      case 4: return storeSize > 0;
      case 5: return true;
      case 6: return true;
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

  // 온보딩 애니메이션 화면
  if (showOnboarding) {
    const onboardingSteps = [
      { icon: Store, title: '업종 선택', desc: '어떤 창업을 준비하시나요?', color: 'bg-amber-500' },
      { icon: MapPin, title: '위치 선택', desc: '창업 예정 지역 선택', color: 'bg-blue-500' },
      { icon: BarChart3, title: '상권 분석', desc: 'AI가 분석하는 상권 정보', color: 'bg-purple-500' },
      { icon: Ruler, title: '매장 규모', desc: '예상 평수 입력', color: 'bg-green-500' },
      { icon: FileText, title: '준비 체크리스트', desc: '현재 상황 파악', color: 'bg-orange-500' },
      { icon: Calculator, title: '예상 비용', desc: '창업 비용 자동 산출', color: 'bg-pink-500' },
      { icon: HeartHandshake, title: 'PM 배정', desc: '전담 매니저 매칭', color: 'bg-brand-600' },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* 배경 효과 */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px] animate-pulse" />
        </div>

        {/* 로고 */}
        <div className="relative z-10 mb-8">
          <div className="w-20 h-20 rounded-3xl bg-white shadow-2xl flex items-center justify-center overflow-hidden">
            <img src="/favicon-new.png" alt="오프닝" className="w-full h-full" />
          </div>
        </div>

        {/* 타이틀 */}
        <h1 className="text-white text-2xl font-black mb-2 text-center relative z-10">
          창업의 모든 과정을
          <br />함께 합니다
        </h1>
        <p className="text-brand-200 text-sm mb-10 relative z-10">총 7단계로 진행됩니다</p>

        {/* 단계 표시 */}
        <div className="relative z-10 w-full max-w-sm space-y-3 mb-10">
          {onboardingSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= onboardingStep;
            const isCurrent = index === onboardingStep;

            return (
              <div
                key={index}
                className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-500 ${
                  isActive ? 'bg-white/20 backdrop-blur-sm' : 'bg-white/5'
                } ${isCurrent ? 'scale-105 shadow-lg' : ''}`}
                style={{
                  opacity: isActive ? 1 : 0.4,
                  transform: `translateX(${isActive ? 0 : 20}px)`,
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <div className={`w-12 h-12 rounded-xl ${isActive ? step.color : 'bg-white/20'} flex items-center justify-center transition-all duration-300`}>
                  {isActive ? (
                    <Icon size={24} className="text-white" />
                  ) : (
                    <span className="text-white/50 font-bold">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-bold ${isActive ? 'text-white' : 'text-white/50'}`}>
                    {step.title}
                  </p>
                  <p className={`text-xs ${isActive ? 'text-white/80' : 'text-white/30'}`}>
                    {step.desc}
                  </p>
                </div>
                {isCurrent && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {/* 진행 버튼 */}
        <button
          onClick={() => {
            if (onboardingStep < onboardingSteps.length - 1) {
              setOnboardingStep(prev => prev + 1);
            } else {
              completeOnboarding();
            }
          }}
          className="relative z-10 w-full max-w-sm bg-white text-brand-700 font-bold py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {onboardingStep < onboardingSteps.length - 1 ? (
            <>다음<ChevronRight size={20} /></>
          ) : (
            <>
              <Rocket size={20} />
              시작하기
            </>
          )}
        </button>

        {/* 스킵 버튼 */}
        <button
          onClick={completeOnboarding}
          className="relative z-10 mt-4 text-white/60 text-sm font-medium hover:text-white transition-colors"
        >
          건너뛰기
        </button>
      </div>
    );
  }

  // 취소 확인 다이얼로그
  const CancelDialog = () => {
    const hasExistingProject = !!project?.id;

    const handleCancel = () => {
      if (hasExistingProject) {
        cancelProject();
      } else {
        // 프로젝트가 없으면 그냥 초기화하고 뒤로가기
        setShowCancelDialog(false);
        setCurrentStep(1);
        setBusinessCategory('');
        setDong('');
        setStoreSize(15);
        setChecklist([]);
        if (onBack) onBack();
      }
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-sm p-6 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-center mb-2">
            {hasExistingProject ? '프로젝트를 취소할까요?' : '창업 상담을 종료할까요?'}
          </h3>
          <p className="text-gray-500 text-center text-sm mb-6">
            {hasExistingProject
              ? '취소하면 현재까지의 진행 상황이 모두 삭제됩니다. 이 작업은 되돌릴 수 없습니다.'
              : '현재까지 입력한 내용이 사라집니다.'}
          </p>
          <div className="space-y-2">
            <button
              onClick={handleCancel}
              className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
            >
              {hasExistingProject ? '프로젝트 취소' : '종료하기'}
            </button>
            <button
              onClick={() => setShowCancelDialog(false)}
              className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              계속 진행하기
            </button>
          </div>
        </div>
      </div>
    );
  };

  // PM 배정 후 화면 (Step 7+)
  if (currentStep >= 7 && assignedPM) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {showCancelDialog && <CancelDialog />}

        {/* 깔끔한 헤더 */}
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCancelDialog(true)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} className="text-gray-500" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg text-slate-900 truncate">내 창업 프로젝트</h1>
              <p className="text-xs text-gray-500">
                강남구 {dong} · {BUSINESS_CATEGORIES.find(c => c.id === businessCategory)?.label} · {storeSize}평
              </p>
            </div>
            <img src="/favicon-new.png" alt="오프닝" className="w-10 h-10 rounded-xl" />
          </div>

          {/* 진행 상태 표시 */}
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-600">PM 배정 완료</span>
              <span className="text-xs text-gray-400">7/7 단계</span>
            </div>
            <div className="flex gap-1">
              {JOURNEY_STEPS.map(s => (
                <div
                  key={s.step}
                  className="h-1.5 flex-1 rounded-full bg-brand-600"
                />
              ))}
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

        {/* 예상 비용 요약 (드롭다운) */}
        <div className="px-4 mb-2">
          <div className="bg-white rounded-xl border overflow-hidden">
            {/* 헤더 - 클릭하면 펼쳐짐 */}
            <button
              onClick={() => setShowCostBreakdown(!showCostBreakdown)}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-700 p-4 text-white text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-brand-100 mb-1">예상 창업 비용</p>
                  <p className="text-2xl font-bold">
                    {formatPrice(estimatedCosts.min)} ~ {formatPrice(estimatedCosts.max)}원
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-brand-200">상세보기</span>
                  {showCostBreakdown ? (
                    <ChevronUp size={20} className="text-white/70" />
                  ) : (
                    <ChevronDown size={20} className="text-white/70" />
                  )}
                </div>
              </div>
            </button>

            {/* 상세 비용 내역 */}
            {showCostBreakdown && (
              <div className="p-4 bg-gray-50 border-t animate-fade-in">
                <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <Calculator size={16} className="text-brand-600" />
                  비용 상세 내역 (강남구 {dong} 기준)
                </h4>

                <div className="space-y-2 text-sm">
                  {/* 보증금/권리금 */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">보증금 + 권리금 (예상)</span>
                    <span className="font-bold">{formatPrice(storeSize * 300)} ~ {formatPrice(storeSize * 800)}원</span>
                  </div>

                  {/* 체크리스트 항목별 비용 */}
                  {checklist.filter(i => i.status !== 'done' && i.estimatedCost.max > 0).map(item => {
                    const isPerPyung = item.estimatedCost.unit.includes('평당');
                    const min = item.estimatedCost.min * (isPerPyung ? storeSize : 1);
                    const max = item.estimatedCost.max * (isPerPyung ? storeSize : 1);
                    return (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">{item.title}</span>
                          {item.status === 'worry' && (
                            <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">도움필요</span>
                          )}
                        </div>
                        <span className="font-medium text-gray-800">
                          {min > 0 ? `${formatPrice(min)} ~ ${formatPrice(max)}원` : '무료'}
                        </span>
                      </div>
                    );
                  })}

                  {/* 이미 준비된 항목 */}
                  {checklist.filter(i => i.status === 'done').length > 0 && (
                    <div className="pt-2 mt-2">
                      <p className="text-xs text-green-600 font-bold mb-1">✓ 이미 준비됨 (비용 제외)</p>
                      <p className="text-xs text-gray-500">
                        {checklist.filter(i => i.status === 'done').map(i => i.title).join(', ')}
                      </p>
                    </div>
                  )}

                  {/* 도움 필요 항목 요약 */}
                  {checklist.filter(i => i.status === 'worry').length > 0 && (
                    <div className="pt-2 mt-2 bg-orange-50 -mx-4 px-4 py-3 border-t border-orange-100">
                      <p className="text-xs text-orange-700 font-bold mb-1">⚠️ PM이 중점 지원할 항목</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {checklist.filter(i => i.status === 'worry').map(item => (
                          <span key={item.id} className="text-xs bg-white text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                            {item.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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

  // 온보딩 단계 (1-6)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showCancelDialog && <CancelDialog />}

      {/* 프로그레스 헤더 */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="flex items-center justify-between px-4 h-14">
          {currentStep > 1 ? (
            <button onClick={goToPrevStep} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft size={24} />
            </button>
          ) : (
            <button onClick={() => setShowCancelDialog(true)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
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
      <div className="flex-1 p-4 pb-40 overflow-y-auto">
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

        {/* Step 3: 상권 분석 */}
        {currentStep === 3 && dong && (
          <div className="space-y-4">
            {/* 지도 */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                <iframe
                  src={`https://map.kakao.com/link/map/${dong},${DONG_COORDINATES[dong]?.lat || 37.5},${DONG_COORDINATES[dong]?.lng || 127.0}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0"
                />
                <div className="absolute top-3 left-3 bg-white px-3 py-1.5 rounded-lg shadow-lg">
                  <div className="flex items-center gap-2">
                    <MapPinned size={16} className="text-brand-600" />
                    <span className="font-bold text-sm">강남구 {dong}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 상권 분석 요약 */}
            {DONG_INFO[dong] && (
              <>
                <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
                  <p className="text-sm text-brand-800">{DONG_INFO[dong].description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* 유동인구 */}
                  <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-2 mb-2 text-gray-500">
                      <Users size={18} />
                      <span className="text-xs font-bold">유동인구</span>
                    </div>
                    <p className="text-lg font-black text-slate-900">{DONG_INFO[dong].footTraffic}</p>
                  </div>

                  {/* 경쟁업체 */}
                  <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-2 mb-2 text-gray-500">
                      <Store size={18} />
                      <span className="text-xs font-bold">
                        주변 {BUSINESS_CATEGORIES.find(c => c.id === businessCategory)?.label || '음식점'}
                      </span>
                    </div>
                    <p className="text-lg font-black text-slate-900">{DONG_INFO[dong].competitors}개</p>
                    <p className="text-xs text-gray-500 mt-1">반경 500m 내</p>
                  </div>

                  {/* 평균 임대료 */}
                  <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-2 mb-2 text-gray-500">
                      <CircleDollarSign size={18} />
                      <span className="text-xs font-bold">평균 임대료</span>
                    </div>
                    <p className="text-lg font-black text-slate-900">{DONG_INFO[dong].avgRent}만원</p>
                    <p className="text-xs text-gray-500 mt-1">평당/월</p>
                  </div>

                  {/* 상권 등급 */}
                  <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-2 mb-2 text-gray-500">
                      <TrendingUp size={18} />
                      <span className="text-xs font-bold">상권 등급</span>
                    </div>
                    <p className="text-lg font-black text-green-600">
                      {DONG_INFO[dong].avgRent >= 350 ? 'A급' : DONG_INFO[dong].avgRent >= 250 ? 'B급' : 'C급'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {DONG_INFO[dong].avgRent >= 350 ? '프리미엄' : DONG_INFO[dong].avgRent >= 250 ? '우량' : '보통'}
                    </p>
                  </div>
                </div>

                {/* 경쟁 분석 */}
                <div className="bg-white rounded-xl border p-4">
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <Eye size={16} className="text-brand-600" />
                    {BUSINESS_CATEGORIES.find(c => c.id === businessCategory)?.label} 경쟁 분석
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">경쟁 강도</span>
                      <span className={`font-bold ${DONG_INFO[dong].competitors > 30 ? 'text-red-600' : DONG_INFO[dong].competitors > 20 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {DONG_INFO[dong].competitors > 30 ? '높음 (과밀)' : DONG_INFO[dong].competitors > 20 ? '보통' : '낮음 (기회)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">배달 수요</span>
                      <span className="font-bold text-brand-600">
                        {DONG_INFO[dong].avgRent < 250 ? '높음' : '보통'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">추천도</span>
                      <span className={`font-bold ${DONG_INFO[dong].competitors < 25 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {DONG_INFO[dong].competitors < 25 ? '추천' : '검토 필요'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 주의사항 */}
                {DONG_INFO[dong].competitors > 30 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-yellow-800">경쟁 과밀 지역</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          해당 지역은 동종 업종이 많습니다. 차별화 전략이 필요하며, PM과 상세 상담을 권장합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 4: 규모 선택 */}
        {currentStep === 4 && (
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

        {/* Step 5: 체크리스트 */}
        {currentStep === 5 && (
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

        {/* Step 6: 비용 산출 & PM 메시지 */}
        {currentStep === 6 && (
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

      {/* 하단 버튼 - 모바일 safe area 대응 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white border-t z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <Button
          fullWidth
          size="lg"
          disabled={!canProceed() || loading}
          onClick={goToNextStep}
          className="h-14 text-base font-bold"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : currentStep === 6 ? (
            <>
              <Rocket size={20} className="mr-2" />
              PM 배정받기
            </>
          ) : (
            <>
              다음 단계로
              <ChevronRight size={20} className="ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
