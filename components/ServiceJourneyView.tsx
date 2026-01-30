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
  Users, TrendingDown, Navigation, MapPinned, CircleDollarSign, Eye,
  Briefcase, MoreHorizontal
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
  attachments?: { url: string; type: string; name: string }[];
  is_read?: boolean;
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
  { id: 'restaurant', label: '음식점', icon: Utensils, color: 'bg-orange-100 text-orange-700' },
  { id: 'chicken', label: '치킨/분식', icon: Utensils, color: 'bg-red-100 text-red-700' },
  { id: 'pub', label: '주점/바', icon: Beer, color: 'bg-purple-100 text-purple-700' },
  { id: 'retail', label: '소매/편의점', icon: ShoppingBag, color: 'bg-blue-100 text-blue-700' },
  { id: 'beauty', label: '미용/뷰티', icon: Scissors, color: 'bg-pink-100 text-pink-700' },
  { id: 'fitness', label: '헬스/운동', icon: Dumbbell, color: 'bg-green-100 text-green-700' },
  { id: 'education', label: '교육/학원', icon: GraduationCap, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'pcroom', label: 'PC방/오락시설', icon: Monitor, color: 'bg-cyan-100 text-cyan-700' },
  { id: 'hotel', label: '호텔/숙박', icon: Building, color: 'bg-rose-100 text-rose-700' },
  { id: 'office', label: '사무실', icon: Briefcase, color: 'bg-slate-100 text-slate-700' },
  { id: 'etc', label: '기타', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700' },
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

// 업종별 체크리스트 데이터 - 공통 + 업종별 특화 (21개 매장 운영자 체크리스트 기반)
const CHECKLIST_COMMON: Omit<ChecklistItem, 'status'>[] = [
  // 1. 사전 준비
  { id: 'concept', category: '사전 준비', title: '창업 컨셉 정리', description: '3W(Who, What, Why), 차별성 확보', icon: Lightbulb, estimatedCost: { min: 0, max: 0, unit: '직접' }, isRequired: true },
  { id: 'budget_plan', category: '사전 준비', title: '예산 계획', description: '창업비 50%, 나머지 50%는 버티기용', icon: Calculator, estimatedCost: { min: 0, max: 0, unit: '직접' }, isRequired: true },
  { id: 'market_research', category: '사전 준비', title: '시장 조사', description: '성공/망한 매장 분석, 경쟁업체 파악', icon: Target, estimatedCost: { min: 0, max: 0, unit: '직접' }, isRequired: true },
  // 2. 입지/계약
  { id: 'location_search', category: '입지/계약', title: '상권 선정', description: '유동인구, 타겟 고객, 상권 특성', icon: Map, estimatedCost: { min: 0, max: 0, unit: '직접' }, isRequired: true },
  { id: 'real_estate', category: '입지/계약', title: '부동산 탐색', description: '공인중개사 비교, 매물 비교', icon: Building, estimatedCost: { min: 0, max: 0, unit: '직접' }, isRequired: true },
  { id: 'registry_check', category: '입지/계약', title: '등기부등본 확인', description: '집주인, 대출 여부, 권리관계', icon: FileText, estimatedCost: { min: 0, max: 2, unit: '만원' }, isRequired: true },
  { id: 'facility_check', category: '입지/계약', title: '시설 점검', description: '전기 용량, 도시가스, 닥트, 수도/배수', icon: FileText, estimatedCost: { min: 0, max: 0, unit: '직접' }, isRequired: true },
  { id: 'contract', category: '입지/계약', title: '부동산 계약', description: '렌트프리 협상, 권리금 흥정 필수!', icon: FileText, estimatedCost: { min: 500, max: 5000, unit: '보증금 만원' }, isRequired: true },
  // 시설/공사 (공통)
  { id: 'demolition', category: '시설/공사', title: '철거 공사', description: '폐기물 처리 비용 포함 계약', icon: Hammer, estimatedCost: { min: 50, max: 150, unit: '평당 만원' }, isRequired: true },
  { id: 'electric', category: '시설/공사', title: '전기/콘센트', description: '콘센트, 조명 여유있게 설계', icon: Lightbulb, estimatedCost: { min: 100, max: 300, unit: '만원' }, isRequired: true },
  { id: 'interior', category: '시설/공사', title: '인테리어 시공', description: '배관→전기→바닥→목작업→타일 순서', icon: PaintBucket, estimatedCost: { min: 150, max: 400, unit: '평당 만원' }, isRequired: true },
  { id: 'signage', category: '시설/공사', title: '간판 설치', description: '외부 간판, 내부 사인물', icon: SignpostBig, estimatedCost: { min: 200, max: 800, unit: '만원' }, isRequired: true },
  { id: 'cleaning', category: '시설/공사', title: '준공 청소', description: '전문 청소 딥클리닝', icon: SparklesIcon, estimatedCost: { min: 20, max: 50, unit: '만원' }, isRequired: true },
  // 인허가 (공통)
  { id: 'business_reg', category: '인허가/행정', title: '사업자등록증', description: '세무서 민원실, 영업신고증 필요', icon: FileText, estimatedCost: { min: 0, max: 0, unit: '무료' }, isRequired: true },
  // 시스템 세팅 (공통)
  { id: 'bank_account', category: '시스템 세팅', title: '사업자 통장', description: '사업자등록증 필요', icon: CreditCard, estimatedCost: { min: 0, max: 0, unit: '무료' }, isRequired: true },
  { id: 'card_merchant', category: '시스템 세팅', title: '카드사 가맹', description: '카드 결제 가맹 계약', icon: CreditCard, estimatedCost: { min: 0, max: 0, unit: '무료' }, isRequired: true },
  { id: 'pos_system', category: '시스템 세팅', title: 'POS/키오스크', description: '주문/결제 시스템', icon: Monitor, estimatedCost: { min: 50, max: 150, unit: '만원' }, isRequired: true },
  { id: 'internet', category: '시스템 세팅', title: '인터넷/통신', description: '업소용 인터넷, 전화', icon: Wifi, estimatedCost: { min: 3, max: 5, unit: '월 만원' }, isRequired: true },
  { id: 'cctv', category: '시스템 세팅', title: 'CCTV', description: '보안 카메라 설치', icon: Eye, estimatedCost: { min: 50, max: 150, unit: '만원' }, isRequired: true },
  // 인력/운영 (공통)
  { id: 'operation_design', category: '인력/운영', title: '오퍼레이션 설계', description: '누가 어디서 무엇을 하는지', icon: Users, estimatedCost: { min: 0, max: 0, unit: '직접' }, isRequired: true },
  { id: 'insurance', category: '인력/운영', title: '보험 가입', description: '화재보험, 영업배상책임보험', icon: Shield, estimatedCost: { min: 30, max: 100, unit: '연 만원' }, isRequired: true },
  // 오픈/마케팅 (공통)
  { id: 'sns_setup', category: '오픈/마케팅', title: 'SNS 세팅', description: '인스타그램, 네이버 플레이스 완벽 세팅', icon: Target, estimatedCost: { min: 0, max: 50, unit: '만원' }, isRequired: true },
  { id: 'photo_shoot', category: '오픈/마케팅', title: '홍보 사진 촬영', description: '메뉴/매장 사진 촬영', icon: Store, estimatedCost: { min: 0, max: 100, unit: '만원' }, isRequired: false },
  { id: 'soft_open', category: '오픈/마케팅', title: '소프트 오픈', description: '지인 초대 금지! 찐 손님으로 테스트', icon: Users, estimatedCost: { min: 0, max: 0, unit: '직접' }, isRequired: true },
  { id: 'grand_open', category: '오픈/마케팅', title: '그랜드 오픈', description: '인력 충분히 배치, 첫 손님 응대가 중요!', icon: Store, estimatedCost: { min: 0, max: 0, unit: '직접' }, isRequired: true },
];

const CHECKLIST_BY_CATEGORY: Record<string, Omit<ChecklistItem, 'status'>[]> = {
  // 음식점 (일반) - 21개 매장 운영자 체크리스트 기반
  restaurant: [
    // 메뉴/컨셉
    { id: 'menu_dev', category: '사전 준비', title: '메뉴 개발/확정', description: '원가율, 제조 난이도, 플레이팅, 비주얼', icon: Utensils, estimatedCost: { min: 0, max: 0, unit: '직접' }, isRequired: true },
    // 인허가
    { id: 'health_cert', category: '인허가/행정', title: '보건증 발급', description: '보건소 방문, 신분증 지참 (인테리어 전 완료!)', icon: Shield, estimatedCost: { min: 0, max: 3, unit: '만원' }, isRequired: true },
    { id: 'hygiene_edu', category: '인허가/행정', title: '위생교육 이수', description: '한국외식업중앙회 (첫 창업은 오프라인 필수)', icon: GraduationCap, estimatedCost: { min: 2, max: 4, unit: '만원' }, isRequired: true },
    { id: 'food_license', category: '인허가/행정', title: '영업신고증', description: '구청 위생과, 일반음식점 권장 (세금혜택)', icon: BookOpen, estimatedCost: { min: 0, max: 5, unit: '만원' }, isRequired: true },
    // 시설/공사
    { id: 'kitchen_layout', category: '시설/공사', title: '주방/홀 동선 설계', description: '주방부터, 콘센트 위치부터 정하기', icon: Map, estimatedCost: { min: 0, max: 50, unit: '만원' }, isRequired: true },
    { id: 'plumbing', category: '시설/공사', title: '배관/배수 공사', description: '배수 빠뜨리면 바닥 다시 깐다! (필수 확인)', icon: Store, estimatedCost: { min: 100, max: 300, unit: '만원' }, isRequired: true },
    { id: 'gas_work', category: '시설/공사', title: '가스 배관 공사', description: '주방 집기 설치 후 가스공사 진행', icon: Flame, estimatedCost: { min: 100, max: 300, unit: '만원' }, isRequired: true },
    { id: 'ventilation', category: '시설/공사', title: '주방 환기/닥트', description: '닥트 배출 경로 (건물주와 협의 필수!)', icon: Wind, estimatedCost: { min: 200, max: 600, unit: '만원' }, isRequired: true },
    // 장비
    { id: 'kitchen_equip', category: '집기/장비', title: '주방 장비', description: '화구, 작업대, 싱크대 (AS 확실한 업체, 잠수주의)', icon: ChefHat, estimatedCost: { min: 500, max: 1500, unit: '만원' }, isRequired: true },
    { id: 'refrigerator', category: '집기/장비', title: '업소용 냉장고', description: '냉장/냉동고 (중고 AS 확인)', icon: Refrigerator, estimatedCost: { min: 150, max: 400, unit: '만원' }, isRequired: true },
    { id: 'furniture', category: '집기/장비', title: '테이블/의자', description: '테이블 수, 홀 동선 고려', icon: Armchair, estimatedCost: { min: 200, max: 600, unit: '만원' }, isRequired: true },
    { id: 'tableware', category: '집기/장비', title: '식기/그릇', description: '접시, 수저, 컵 등 (미리 발주!)', icon: Utensils, estimatedCost: { min: 50, max: 200, unit: '만원' }, isRequired: true },
    // 운영
    { id: 'supplier', category: '시스템 세팅', title: '식자재 도매처', description: '정기 배송 계약', icon: Truck, estimatedCost: { min: 0, max: 0, unit: '업체 연결' }, isRequired: true },
    { id: 'beverage_supplier', category: '시스템 세팅', title: '음료/주류사 계약', description: '제빙기/냉장고 협상 필수!', icon: Beer, estimatedCost: { min: 0, max: 0, unit: '업체 연결' }, isRequired: true },
    { id: 'hiring', category: '인력/운영', title: '직원 채용', description: '서빙, 주방, 설거지 파트별 책임 분배', icon: Users, estimatedCost: { min: 0, max: 0, unit: '인건비' }, isRequired: false },
    { id: 'manual', category: '인력/운영', title: '운영 매뉴얼', description: '메뉴 매뉴얼 + 서비스 매뉴얼 준비', icon: BookOpen, estimatedCost: { min: 0, max: 0, unit: '직접' }, isRequired: true },
    { id: 'delivery_app', category: '오픈/마케팅', title: '배달앱 입점', description: '배민, 요기요, 쿠팡이츠', icon: Bike, estimatedCost: { min: 0, max: 50, unit: '만원' }, isRequired: false },
  ],

  // 치킨/분식 - 배달 특화
  chicken: [
    { id: 'menu_dev', category: '사전 준비', title: '메뉴 개발/확정', description: '원가율, 제조 난이도, 배달 포장 고려', icon: Utensils, estimatedCost: { min: 0, max: 0, unit: '직접' }, isRequired: true },
    { id: 'health_cert', category: '인허가/행정', title: '보건증 발급', description: '보건소 방문 (인테리어 전 완료!)', icon: Shield, estimatedCost: { min: 0, max: 3, unit: '만원' }, isRequired: true },
    { id: 'hygiene_edu', category: '인허가/행정', title: '위생교육 이수', description: '한국외식업중앙회', icon: GraduationCap, estimatedCost: { min: 2, max: 4, unit: '만원' }, isRequired: true },
    { id: 'food_license', category: '인허가/행정', title: '영업신고증', description: '구청 위생과', icon: BookOpen, estimatedCost: { min: 0, max: 5, unit: '만원' }, isRequired: true },
    { id: 'ventilation', category: '시설/공사', title: '주방 환기/후드', description: '튀김 연기 배출 필수! (치킨집 핵심)', icon: Wind, estimatedCost: { min: 300, max: 800, unit: '만원' }, isRequired: true },
    { id: 'gas_work', category: '시설/공사', title: '가스 배관 공사', description: '업소용 가스 용량 증설', icon: Flame, estimatedCost: { min: 100, max: 300, unit: '만원' }, isRequired: true },
    { id: 'fryer', category: '집기/장비', title: '업소용 튀김기', description: '전기/가스 튀김기 2~3구', icon: ChefHat, estimatedCost: { min: 200, max: 500, unit: '만원' }, isRequired: true },
    { id: 'refrigerator', category: '집기/장비', title: '업소용 냉장/냉동고', description: '원재료 보관용 대용량', icon: Refrigerator, estimatedCost: { min: 150, max: 400, unit: '만원' }, isRequired: true },
    { id: 'prep_table', category: '집기/장비', title: '작업대/싱크대', description: '스텐 작업대, 3조 싱크대', icon: Box, estimatedCost: { min: 100, max: 250, unit: '만원' }, isRequired: true },
    { id: 'packaging', category: '집기/장비', title: '포장 용기/봉투', description: '치킨박스, 봉투, 소스용기 (미리 발주!)', icon: Package, estimatedCost: { min: 30, max: 100, unit: '만원' }, isRequired: true },
    { id: 'supplier', category: '시스템 세팅', title: '원재료 공급처', description: '닭, 튀김가루, 소스 등 계약', icon: Truck, estimatedCost: { min: 0, max: 0, unit: '업체 연결' }, isRequired: true },
    { id: 'delivery_app', category: '오픈/마케팅', title: '배달앱 입점', description: '배민, 쿠팡이츠, 요기요 (필수!)', icon: Bike, estimatedCost: { min: 0, max: 50, unit: '만원' }, isRequired: true },
    { id: 'delivery_agency', category: '오픈/마케팅', title: '배달대행 계약', description: '배달권역 설정, 대행사 계약', icon: Truck, estimatedCost: { min: 0, max: 0, unit: '건당 과금' }, isRequired: true },
  ],

  // 카페
  cafe: [
    { id: 'menu_dev', category: '사전 준비', title: '메뉴 개발/확정', description: '시그니처 음료, 디저트 구성', icon: Coffee, estimatedCost: { min: 0, max: 0, unit: '직접' }, isRequired: true },
    { id: 'health_cert', category: '인허가/행정', title: '보건증 발급', description: '보건소 방문', icon: Shield, estimatedCost: { min: 0, max: 3, unit: '만원' }, isRequired: true },
    { id: 'hygiene_edu', category: '인허가/행정', title: '위생교육 이수', description: '한국외식업중앙회', icon: GraduationCap, estimatedCost: { min: 2, max: 4, unit: '만원' }, isRequired: true },
    { id: 'food_license', category: '인허가/행정', title: '휴게음식점 영업신고', description: '구청 위생과', icon: BookOpen, estimatedCost: { min: 0, max: 5, unit: '만원' }, isRequired: true },
    { id: 'espresso_machine', category: '집기/장비', title: '에스프레소 머신', description: '2그룹 이상 (중고 AS 확인)', icon: Coffee, estimatedCost: { min: 500, max: 3000, unit: '만원' }, isRequired: true },
    { id: 'grinder', category: '집기/장비', title: '커피 그라인더', description: '온디맨드 그라인더', icon: Coffee, estimatedCost: { min: 100, max: 500, unit: '만원' }, isRequired: true },
    { id: 'refrigerator', category: '집기/장비', title: '냉장고/제빙기', description: '쇼케이스, 제빙기', icon: Refrigerator, estimatedCost: { min: 200, max: 500, unit: '만원' }, isRequired: true },
    { id: 'furniture', category: '집기/장비', title: '테이블/의자', description: '카페 감성 홀 가구', icon: Armchair, estimatedCost: { min: 200, max: 800, unit: '만원' }, isRequired: true },
    { id: 'coffee_supplier', category: '시스템 세팅', title: '원두 거래처', description: '로스터리 계약, 원두 선정', icon: Coffee, estimatedCost: { min: 0, max: 0, unit: '업체 연결' }, isRequired: true },
    { id: 'barista_training', category: '인력/운영', title: '바리스타 교육', description: '커피 추출 교육', icon: GraduationCap, estimatedCost: { min: 50, max: 200, unit: '만원' }, isRequired: false },
  ],

  // 주점/바
  pub: [
    { id: 'menu_dev', category: '사전 준비', title: '메뉴 개발/확정', description: '안주 메뉴, 주류 구성', icon: Beer, estimatedCost: { min: 0, max: 0, unit: '직접' }, isRequired: true },
    { id: 'health_cert', category: '인허가/행정', title: '보건증 발급', description: '보건소 방문', icon: Shield, estimatedCost: { min: 0, max: 3, unit: '만원' }, isRequired: true },
    { id: 'hygiene_edu', category: '인허가/행정', title: '위생교육 이수', description: '한국외식업중앙회', icon: GraduationCap, estimatedCost: { min: 2, max: 4, unit: '만원' }, isRequired: true },
    { id: 'food_license', category: '인허가/행정', title: '일반음식점 영업신고', description: '주류 판매 위해 일반음식점 필수!', icon: BookOpen, estimatedCost: { min: 0, max: 5, unit: '만원' }, isRequired: true },
    { id: 'ventilation', category: '시설/공사', title: '환기 시스템', description: '주방 환기, 홀 공조', icon: Wind, estimatedCost: { min: 200, max: 500, unit: '만원' }, isRequired: true },
    { id: 'refrigerator', category: '집기/장비', title: '냉장고/제빙기', description: '음료 냉장고, 제빙기', icon: Refrigerator, estimatedCost: { min: 200, max: 500, unit: '만원' }, isRequired: true },
    { id: 'furniture', category: '집기/장비', title: '테이블/의자/바', description: '홀 가구, 바 테이블', icon: Armchair, estimatedCost: { min: 300, max: 1000, unit: '만원' }, isRequired: true },
    { id: 'kitchen_equip', category: '집기/장비', title: '간단 주방 장비', description: '안주 조리용 장비', icon: ChefHat, estimatedCost: { min: 200, max: 500, unit: '만원' }, isRequired: true },
    { id: 'liquor_supplier', category: '시스템 세팅', title: '주류사 계약', description: '맥주, 소주, 양주 (제빙기/냉장고 협상 필수!)', icon: Beer, estimatedCost: { min: 0, max: 0, unit: '업체 연결' }, isRequired: true },
    { id: 'hiring', category: '인력/운영', title: '직원 채용', description: '서빙, 바텐더', icon: Users, estimatedCost: { min: 0, max: 0, unit: '인건비' }, isRequired: false },
  ],

  // 소매/편의점
  retail: [
    { id: 'retail_license', category: '인허가/행정', title: '소매업 신고', description: '업종별 신고/등록', icon: BookOpen, estimatedCost: { min: 0, max: 10, unit: '만원' }, isRequired: true },
    { id: 'display_shelf', category: '장비', title: '진열대/선반', description: '곤돌라, 벽면 선반', icon: Box, estimatedCost: { min: 200, max: 800, unit: '만원' }, isRequired: true },
    { id: 'showcase', category: '장비', title: '쇼케이스/냉장고', description: '음료 냉장고, 아이스크림 냉동고', icon: Refrigerator, estimatedCost: { min: 300, max: 1000, unit: '만원' }, isRequired: true },
    { id: 'counter', category: '장비', title: '카운터/계산대', description: '계산대, 담배 진열대', icon: Store, estimatedCost: { min: 100, max: 300, unit: '만원' }, isRequired: true },
    { id: 'inventory_system', category: '운영 준비', title: '재고관리 시스템', description: '바코드, 재고 관리', icon: Monitor, estimatedCost: { min: 50, max: 200, unit: '만원' }, isRequired: true },
    { id: 'supplier', category: '운영 준비', title: '도매처 계약', description: '상품 공급 계약', icon: Truck, estimatedCost: { min: 0, max: 0, unit: '업체 연결' }, isRequired: true },
  ],

  // 미용/뷰티
  beauty: [
    { id: 'beauty_license', category: '인허가/행정', title: '미용사 면허', description: '국가자격증 확인', icon: BookOpen, estimatedCost: { min: 0, max: 0, unit: '자격증' }, isRequired: true },
    { id: 'beauty_permit', category: '인허가/행정', title: '미용업 신고', description: '구청 위생과 신고', icon: FileText, estimatedCost: { min: 0, max: 5, unit: '만원' }, isRequired: true },
    { id: 'plumbing', category: '시설/공사', title: '샴푸대 배관', description: '샴푸대 위치, 배수 설계', icon: Store, estimatedCost: { min: 100, max: 300, unit: '만원' }, isRequired: true },
    { id: 'beauty_chair', category: '장비', title: '미용 의자/경대', description: '시술 의자, 거울, 경대', icon: Armchair, estimatedCost: { min: 300, max: 800, unit: '만원' }, isRequired: true },
    { id: 'shampoo_unit', category: '장비', title: '샴푸대', description: '샴푸 유닛, 배수 연결', icon: Store, estimatedCost: { min: 100, max: 300, unit: '만원' }, isRequired: true },
    { id: 'beauty_tools', category: '장비', title: '미용 기기/도구', description: '드라이어, 고데기, 염색 도구', icon: Scissors, estimatedCost: { min: 100, max: 400, unit: '만원' }, isRequired: true },
    { id: 'beauty_supplier', category: '운영 준비', title: '미용 재료 거래처', description: '염색약, 펌약, 소모품', icon: Truck, estimatedCost: { min: 0, max: 0, unit: '업체 연결' }, isRequired: true },
  ],

  // 헬스/운동
  fitness: [
    { id: 'sports_permit', category: '인허가/행정', title: '체육시설업 신고', description: '구청 체육과 신고', icon: BookOpen, estimatedCost: { min: 0, max: 10, unit: '만원' }, isRequired: true },
    { id: 'shower_room', category: '시설/공사', title: '샤워실/탈의실', description: '샤워부스, 락커, 배관', icon: Store, estimatedCost: { min: 300, max: 800, unit: '만원' }, isRequired: true },
    { id: 'gym_equip', category: '장비', title: '운동 기구', description: '유산소, 웨이트 기구', icon: Dumbbell, estimatedCost: { min: 1000, max: 5000, unit: '만원' }, isRequired: true },
    { id: 'locker', category: '장비', title: '락커/수납', description: '개인 락커, 수건 보관', icon: Box, estimatedCost: { min: 100, max: 400, unit: '만원' }, isRequired: true },
    { id: 'flooring', category: '시설/공사', title: '바닥 시공', description: '운동용 특수 바닥재', icon: PaintBucket, estimatedCost: { min: 200, max: 600, unit: '만원' }, isRequired: true },
    { id: 'trainer_hire', category: '운영 준비', title: '트레이너 채용', description: 'PT 트레이너, 자격 확인', icon: Users, estimatedCost: { min: 0, max: 0, unit: '인건비' }, isRequired: false },
  ],

  // 교육/학원
  education: [
    { id: 'academy_reg', category: '인허가/행정', title: '학원 등록', description: '교육청 학원 등록', icon: BookOpen, estimatedCost: { min: 0, max: 20, unit: '만원' }, isRequired: true },
    { id: 'desk_chair', category: '장비', title: '책상/의자', description: '학생용 책걸상', icon: Armchair, estimatedCost: { min: 200, max: 600, unit: '만원' }, isRequired: true },
    { id: 'whiteboard', category: '장비', title: '칠판/화이트보드', description: '강의용 보드, 스크린', icon: Box, estimatedCost: { min: 50, max: 200, unit: '만원' }, isRequired: true },
    { id: 'edu_material', category: '장비', title: '교재/교구', description: '학습 교재, 교육 도구', icon: BookOpen, estimatedCost: { min: 100, max: 500, unit: '만원' }, isRequired: true },
    { id: 'teacher_hire', category: '운영 준비', title: '강사 채용', description: '과목별 강사 채용', icon: Users, estimatedCost: { min: 0, max: 0, unit: '인건비' }, isRequired: true },
    { id: 'student_recruit', category: '운영 준비', title: '수강생 모집', description: '홍보, 상담, 등록', icon: Target, estimatedCost: { min: 50, max: 300, unit: '만원' }, isRequired: true },
  ],

  // 사무실
  office: [
    { id: 'office_furniture', category: '장비', title: '사무용 가구', description: '책상, 의자, 수납장', icon: Armchair, estimatedCost: { min: 200, max: 800, unit: '만원' }, isRequired: true },
    { id: 'meeting_room', category: '장비', title: '회의실 세팅', description: '회의 테이블, 프로젝터', icon: Users, estimatedCost: { min: 100, max: 400, unit: '만원' }, isRequired: false },
    { id: 'network', category: '운영 준비', title: '네트워크/전화', description: '인터넷, 전화 설치', icon: Wifi, estimatedCost: { min: 30, max: 100, unit: '만원' }, isRequired: true },
  ],

  // PC방
  pcroom: [
    { id: 'game_biz_reg', category: '인허가/행정', title: '게임제공업 등록', description: '구청 문화체육과 (영업시간 제한 확인)', icon: BookOpen, estimatedCost: { min: 0, max: 10, unit: '만원' }, isRequired: true },
    { id: 'youth_protect', category: '인허가/행정', title: '청소년 보호 교육', description: '청소년보호 책임자 교육 이수', icon: Shield, estimatedCost: { min: 2, max: 5, unit: '만원' }, isRequired: true },
    { id: 'fire_safety', category: '인허가/행정', title: '소방시설 완비증명', description: '소방서 발급 (50석 이상 필수)', icon: Shield, estimatedCost: { min: 0, max: 50, unit: '만원' }, isRequired: true },
    { id: 'electric_upgrade', category: '시설/공사', title: '전기 증설', description: 'PC 대수에 따른 용량 증설 (필수!)', icon: Lightbulb, estimatedCost: { min: 200, max: 500, unit: '만원' }, isRequired: true },
    { id: 'network_infra', category: '시설/공사', title: '네트워크 구축', description: '기가 인터넷, LAN 배선, 스위칭 허브', icon: Wifi, estimatedCost: { min: 200, max: 500, unit: '만원' }, isRequired: true },
    { id: 'aircon', category: '시설/공사', title: '에어컨/환기', description: 'PC 발열 대비 냉방/환기 필수', icon: Wind, estimatedCost: { min: 300, max: 800, unit: '만원' }, isRequired: true },
    { id: 'pc_setup', category: '장비', title: 'PC/모니터', description: '게이밍 PC, 144Hz 모니터 (50대 기준)', icon: Monitor, estimatedCost: { min: 5000, max: 10000, unit: '만원' }, isRequired: true },
    { id: 'gaming_chair', category: '장비', title: '게이밍 체어/책상', description: '인체공학 의자, PC방 전용 책상', icon: Armchair, estimatedCost: { min: 500, max: 1500, unit: '만원' }, isRequired: true },
    { id: 'peripherals', category: '장비', title: '키보드/마우스/헤드셋', description: '게이밍 기어 (파손 대비 여분 필수)', icon: Box, estimatedCost: { min: 300, max: 800, unit: '만원' }, isRequired: true },
    { id: 'game_license', category: '시스템 세팅', title: '게임 라이선스', description: 'PC방 전용 게임 라이선스 계약', icon: FileText, estimatedCost: { min: 50, max: 150, unit: '월 만원' }, isRequired: true },
    { id: 'pcroom_system', category: '시스템 세팅', title: 'PC방 관리 프로그램', description: '사이버플러스/아이카페 등 관리솔루션', icon: Monitor, estimatedCost: { min: 100, max: 300, unit: '만원' }, isRequired: true },
    { id: 'food_corner', category: '부가 서비스', title: '스낵코너/음료', description: '자판기, 라면기, 음료 냉장고', icon: Coffee, estimatedCost: { min: 200, max: 500, unit: '만원' }, isRequired: false },
  ],

  // 호텔/숙박시설
  hotel: [
    { id: 'hotel_biz_reg', category: '인허가/행정', title: '숙박업 등록', description: '구청 관광과/위생과 (등급별 기준 상이)', icon: BookOpen, estimatedCost: { min: 10, max: 50, unit: '만원' }, isRequired: true },
    { id: 'fire_safety', category: '인허가/행정', title: '소방안전 검사', description: '소방시설 완비, 피난안내도 설치', icon: Shield, estimatedCost: { min: 100, max: 500, unit: '만원' }, isRequired: true },
    { id: 'building_permit', category: '인허가/행정', title: '건축물 용도 변경', description: '숙박시설 용도 확인/변경', icon: Building, estimatedCost: { min: 0, max: 500, unit: '만원' }, isRequired: true },
    { id: 'hygiene_check', category: '인허가/행정', title: '위생점검 준비', description: '객실별 욕실, 환기, 채광 기준', icon: Shield, estimatedCost: { min: 0, max: 0, unit: '점검' }, isRequired: true },
    { id: 'room_interior', category: '시설/공사', title: '객실 인테리어', description: '객실 내부 인테리어, 방음', icon: PaintBucket, estimatedCost: { min: 200, max: 500, unit: '객실당 만원' }, isRequired: true },
    { id: 'bathroom', category: '시설/공사', title: '욕실 시공', description: '객실별 샤워시설, 배관', icon: Store, estimatedCost: { min: 150, max: 400, unit: '객실당 만원' }, isRequired: true },
    { id: 'room_furniture', category: '장비', title: '객실 가구', description: '침대, 옷장, TV, 테이블', icon: Armchair, estimatedCost: { min: 100, max: 300, unit: '객실당 만원' }, isRequired: true },
    { id: 'bedding', category: '장비', title: '침구류', description: '이불, 베개, 시트 (교체용 여분)', icon: Box, estimatedCost: { min: 30, max: 100, unit: '객실당 만원' }, isRequired: true },
    { id: 'amenities', category: '장비', title: '어메니티', description: '샴푸, 칫솔, 타월, 슬리퍼', icon: Package, estimatedCost: { min: 5, max: 20, unit: '객실당 만원' }, isRequired: true },
    { id: 'front_system', category: '시스템 세팅', title: '프론트 시스템', description: '객실관리, 예약관리 PMS', icon: Monitor, estimatedCost: { min: 100, max: 500, unit: '만원' }, isRequired: true },
    { id: 'door_lock', category: '시스템 세팅', title: '객실 도어락', description: '카드키/번호 도어락', icon: Shield, estimatedCost: { min: 20, max: 50, unit: '객실당 만원' }, isRequired: true },
    { id: 'ota_register', category: '오픈/마케팅', title: 'OTA 입점', description: '야놀자, 여기어때, 부킹닷컴 등록', icon: Target, estimatedCost: { min: 0, max: 0, unit: '수수료' }, isRequired: true },
    { id: 'cleaning_staff', category: '인력/운영', title: '청소/하우스키핑', description: '객실 청소 인력/업체 계약', icon: Users, estimatedCost: { min: 0, max: 0, unit: '인건비' }, isRequired: true },
    { id: 'laundry', category: '인력/운영', title: '린넨 세탁 계약', description: '침구, 타월 세탁 업체', icon: Truck, estimatedCost: { min: 0, max: 0, unit: '업체 연결' }, isRequired: true },
  ],

  // 기타 (default)
  etc: [
    { id: 'license', category: '인허가/행정', title: '업종별 인허가', description: '업종에 맞는 인허가', icon: BookOpen, estimatedCost: { min: 0, max: 20, unit: '만원' }, isRequired: true },
    { id: 'equipment', category: '장비', title: '업종별 장비', description: '필수 장비/집기', icon: Box, estimatedCost: { min: 500, max: 2000, unit: '만원' }, isRequired: true },
    { id: 'furniture', category: '장비', title: '가구/집기', description: '테이블, 의자 등', icon: Armchair, estimatedCost: { min: 200, max: 800, unit: '만원' }, isRequired: true },
  ],
};

// 업종 ID -> 체크리스트 매핑 (공통 + 업종별)
const getChecklistForCategory = (categoryId: string): Omit<ChecklistItem, 'status'>[] => {
  const specificItems = CHECKLIST_BY_CATEGORY[categoryId] || CHECKLIST_BY_CATEGORY.etc;
  // 공통 항목 + 업종별 특화 항목 합치기
  return [...CHECKLIST_COMMON, ...specificItems];
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

// 단계별 색상 테마
const STEP_COLORS: Record<number, { bg: string; text: string; accent: string }> = {
  7: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600', accent: 'bg-blue-100' },
  8: { bg: 'from-purple-500 to-purple-600', text: 'text-purple-600', accent: 'bg-purple-100' },
  9: { bg: 'from-orange-500 to-orange-600', text: 'text-orange-600', accent: 'bg-orange-100' },
  10: { bg: 'from-yellow-500 to-yellow-600', text: 'text-yellow-600', accent: 'bg-yellow-100' },
  11: { bg: 'from-green-500 to-green-600', text: 'text-green-600', accent: 'bg-green-100' },
  12: { bg: 'from-slate-500 to-slate-600', text: 'text-slate-600', accent: 'bg-slate-100' },
};

const PM_STEP_LABELS: Record<number, string> = {
  7: '상담 시작',
  8: '비용 컨설팅',
  9: '계약/착수',
  10: '진행중',
  11: '오픈 완료',
  12: '사후관리'
};

export const ServiceJourneyView: React.FC<ServiceJourneyViewProps> = ({ onBack, isGuestMode = false }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(!isGuestMode); // 게스트 모드는 로딩 없음
  const [project, setProject] = useState<Project | null>(null);

  // 단계 변경 알림
  const [showStepToast, setShowStepToast] = useState(false);
  const [lastSeenStep, setLastSeenStep] = useState<number | null>(null);

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

      // 단계 변경 감지 및 토스트 표시
      const savedStep = localStorage.getItem(`project_${proj.id}_step`);
      if (savedStep && parseInt(savedStep) !== proj.current_step && proj.current_step >= 7) {
        setShowStepToast(true);
        setTimeout(() => setShowStepToast(false), 4000);
      }
      localStorage.setItem(`project_${proj.id}_step`, String(proj.current_step));
      setLastSeenStep(proj.current_step);

      if (proj.pm) {
        setAssignedPM(proj.pm);
      }

      loadMessages(proj.id);
      subscribeToMessages(proj.id);
      subscribeToProjectUpdates(proj.id);
    }

    setLoading(false);
  };

  // 프로젝트 변경사항 실시간 구독
  const subscribeToProjectUpdates = (projectId: string) => {
    supabase
      .channel(`project-updates-${projectId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'startup_projects',
        filter: `id=eq.${projectId}`
      }, (payload: any) => {
        const newStep = payload.new.current_step;
        const prevStep = lastSeenStep || project?.current_step;

        if (newStep !== prevStep && newStep >= 7) {
          setCurrentStep(newStep);
          setLastSeenStep(newStep);
          setShowStepToast(true);
          localStorage.setItem(`project_${projectId}_step`, String(newStep));
          setTimeout(() => setShowStepToast(false), 4000);
        }
      })
      .subscribe();
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
  const stepColor = STEP_COLORS[currentStep] || STEP_COLORS[7];
  const pmStepNumber = currentStep >= 7 ? currentStep - 6 : 1;

  if (currentStep >= 7 && assignedPM) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {showCancelDialog && <CancelDialog />}

        {/* 단계 변경 토스트 알림 */}
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
            showStepToast
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className={`bg-gradient-to-r ${stepColor.bg} text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3`}>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black text-lg">
              {pmStepNumber}
            </div>
            <div>
              <p className="text-white/80 text-xs font-bold">단계가 변경되었습니다</p>
              <p className="font-bold text-lg">{PM_STEP_LABELS[currentStep]}</p>
            </div>
          </div>
        </div>

        {/* 깔끔한 헤더 + 단계별 색상 */}
        <div className={`bg-gradient-to-r ${stepColor.bg} text-white px-4 py-3`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCancelDialog(true)}
              className="p-2 -ml-2 hover:bg-white/10 rounded-full"
            >
              <X size={20} className="text-white/80" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg truncate">내 창업 프로젝트</h1>
              <p className="text-xs text-white/70">
                강남구 {dong} · {BUSINESS_CATEGORIES.find(c => c.id === businessCategory)?.label} · {storeSize}평
              </p>
            </div>
            <img src="/favicon-new.png" alt="오프닝" className="w-10 h-10 rounded-xl bg-white/20 p-1" />
          </div>

          {/* PM 진행 단계 표시 (6단계) */}
          <div className="mt-4 pt-3 border-t border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">{PM_STEP_LABELS[currentStep]}</span>
              <span className="text-xs text-white/70">{pmStepNumber}/6 단계</span>
            </div>
            <div className="flex gap-1.5">
              {[7, 8, 9, 10, 11, 12].map(step => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    step <= currentStep ? 'bg-white' : 'bg-white/30'
                  }`}
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
                  {/* 이미지 첨부파일 표시 */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-2">
                      {msg.attachments.map((att, idx) => (
                        <img
                          key={idx}
                          src={att.url}
                          alt={att.name}
                          className="max-w-full rounded-lg cursor-pointer hover:opacity-90"
                          onClick={() => window.open(att.url, '_blank')}
                        />
                      ))}
                    </div>
                  )}
                  {msg.message !== '📷 이미지' && (
                    <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                  )}
                  <div className={`flex items-center gap-2 mt-1 ${
                    msg.sender_type === 'USER' ? 'text-white/70' : 'text-gray-400'
                  }`}>
                    <span className="text-[10px]">
                      {new Date(msg.created_at).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {/* 내가 보낸 메시지에 읽음 표시 */}
                    {msg.sender_type === 'USER' && msg.is_read && (
                      <span className="text-[10px]">✓ 읽음</span>
                    )}
                  </div>
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
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
      {showCancelDialog && <CancelDialog />}

      {/* 프로그레스 헤더 */}
      <div className="sticky top-0 bg-white border-b z-40">
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

      {/* 컨텐츠 - 하단 버튼 영역 확보 */}
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
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <div className="px-4 py-3">
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
    </div>
  );
};
