import { CategoryNode, Package, ItemGrade, Product, ConsultingOption, OpenTaskCategory, OpenTaskItem } from './types';
import { 
  Utensils, ShoppingBag, Scissors, GraduationCap, 
  Stethoscope, Gamepad2, Building2, Car, BedDouble 
} from 'lucide-react';

// 1. 업종 카테고리 트리 (확장판)
export const CATEGORY_TREE: CategoryNode[] = [
  {
    id: 'FOOD',
    label: '음식·외식',
    icon: Utensils,
    children: [
      { id: 'KOREAN', label: '한식', children: [
        { id: 'korean_soup', label: '국물요리/탕' },
        { id: 'korean_meat', label: '고기구이/육회' },
        { id: 'korean_pork', label: '삼겹살/돼지갈비' },
        { id: 'korean_beef', label: '소갈비/정육식당' },
        { id: 'korean_chicken', label: '닭요리/닭갈비' },
        { id: 'korean_bossam', label: '보쌈/족발' },
        { id: 'korean_sundae', label: '순대/곱창' },
        { id: 'korean_rice', label: '비빔밥/돌솥밥' },
        { id: 'korean_stew', label: '찌개류' },
        { id: 'korean_set', label: '한정식/백반' },
      ]},
      { id: 'JAPANESE', label: '일식', children: [
        { id: 'jp_general', label: '일식 전문점' },
        { id: 'jp_donkatsu', label: '돈까스/카레' },
        { id: 'jp_ramen', label: '라멘/우동/소바' },
        { id: 'jp_sushi', label: '초밥' },
        { id: 'jp_izakaya', label: '이자카야' },
      ]},
      { id: 'CHINESE', label: '중식', children: [
        { id: 'cn_general', label: '일반 중식당' },
        { id: 'cn_mala', label: '마라/양꼬치/훠궈' },
        { id: 'cn_tangsuyuk', label: '탕수육' },
        { id: 'cn_jjamppong', label: '짬뽕' },
      ]},
      { id: 'WESTERN', label: '양식', children: [
        { id: 'west_family', label: '패밀리 레스토랑' },
        { id: 'west_italian', label: '이탈리안/파스타' },
        { id: 'west_steak', label: '스테이크' },
        { id: 'west_bbq', label: '바비큐' },
      ]},
      { id: 'BUNSIK', label: '분식/국수', children: [
        { id: 'bunsik_general', label: '분식 전문점' },
        { id: 'bunsik_noodle', label: '칼국수/면' },
        { id: 'bunsik_mandu', label: '만두/수제비' },
        { id: 'bunsik_naengmyeon', label: '냉면' },
      ]},
      { id: 'CHICKEN', label: '치킨/피자', children: [
        { id: 'chicken_general', label: '치킨 전문점' },
        { id: 'pizza_general', label: '피자 전문점' },
      ]},
      { id: 'FASTFOOD', label: '패스트푸드', children: [
        { id: 'fast_burger', label: '버거 전문점' },
        { id: 'fast_sandwich', label: '샌드위치/토스트/핫도그' },
        { id: 'fast_donut', label: '도넛/꽈배기/호떡' },
        { id: 'fast_salad', label: '샐러드/다이어트' },
        { id: 'fast_lunchbox', label: '도시락/컵밥' },
        { id: 'fast_tanghuru', label: '탕후루' },
      ]},
      { id: 'CAFE', label: '카페/커피/찻집', children: [
        { id: 'cafe_coffee', label: '커피 전문점' },
        { id: 'cafe_dessert', label: '카페/디저트' },
        { id: 'cafe_takeout', label: '테이크아웃 음료' },
        { id: 'cafe_tea', label: '전통찻집' },
      ]},
      { id: 'BAKERY', label: '제과제빵', children: [
        { id: 'bakery_bread', label: '제과/제빵' },
        { id: 'bakery_cake', label: '케이크' },
        { id: 'bakery_tteok', label: '떡/한과' },
      ]},
      { id: 'PUB', label: '주점', children: [
        { id: 'pub_pocha', label: '포장마차/소주방' },
        { id: 'pub_hof', label: '호프/맥주' },
        { id: 'pub_wine', label: '와인/칵테일/위스키 바' },
        { id: 'pub_izakaya', label: '이자까야/꼬치구이' },
        { id: 'pub_bar', label: '바/라운지' },
      ]},
      { id: 'FUSION', label: '퓨전/세계요리', children: [
        { id: 'fusion_general', label: '퓨전음식' },
        { id: 'fusion_viet', label: '베트남음식' },
        { id: 'fusion_thai', label: '태국음식' },
        { id: 'fusion_india', label: '인도음식' },
      ]},
      { id: 'SEAFOOD', label: '수산물', children: [
        { id: 'sea_sashimi', label: '회/수산물' },
        { id: 'sea_tuna', label: '참치' },
        { id: 'sea_eel', label: '장어' },
        { id: 'sea_crab', label: '게요리/대게' },
        { id: 'sea_shell', label: '조개구이/조개찜' },
        { id: 'sea_octopus', label: '낙지/문어/쭈꾸미' },
      ]},
      { id: 'BUFFET', label: '뷔페', children: [
        { id: 'buffet_general', label: '종합 뷔페' },
        { id: 'buffet_meat', label: '고기 뷔페' },
        { id: 'buffet_seafood', label: '해물 뷔페' },
      ]},
    ]
  },
  {
    id: 'RETAIL',
    label: '소매·유통',
    icon: ShoppingBag,
    children: [
      { id: 'CVS', label: '편의점/마트', children: [] },
      { id: 'GROCERY', label: '음식료품', children: [] },
      { id: 'HEALTH_FOOD', label: '건강식품', children: [] },
      { id: 'BABY', label: '유아용품', children: [] },
      { id: 'COSMETIC', label: '화장품', children: [] },
      { id: 'CLOTHES', label: '의류/패션', children: [] },
      { id: 'BAG_SHOES', label: '가방/신발/액세서리', children: [] },
      { id: 'SPORTS', label: '운동/스포츠용품', children: [] },
      { id: 'BOOK', label: '서점', children: [] },
      { id: 'GIFT', label: '선물/팬시/기념품', children: [] },
      { id: 'FLOWER', label: '꽃/식물/화초', children: [] },
      { id: 'OPTIC', label: '안경점', children: [] },
      { id: 'JEWELRY', label: '시계/귀금속', children: [] },
      { id: 'FURNITURE', label: '가구', children: [] },
      { id: 'OFFICE_SUPPLY', label: '사무/문구', children: [] },
      { id: 'HOME_INT', label: '가정/주방/인테리어', children: [] },
      { id: 'ELECTRONICS', label: '가전제품', children: [] },
      { id: 'PET', label: '애견/애완용품', children: [] },
      { id: 'PHARMACY', label: '의약/의료품', children: [] },
    ]
  },
  {
    id: 'SERVICE',
    label: '서비스',
    icon: Scissors,
    children: [
      { id: 'LAUNDRY', label: '세탁/빨래', children: [] },
      { id: 'CLEANING', label: '청소/가사', children: [] },
      { id: 'REPAIR', label: '개인/가정용품 수리', children: [] },
      { id: 'SAUNA', label: '목욕탕/사우나/찜질방', children: [] },
      { id: 'HAIR', label: '헤어/이발/미용', children: [] },
      { id: 'SKIN', label: '피부/체형관리', children: [] },
      { id: 'NAIL', label: '네일/속눈썹', children: [] },
      { id: 'RENTAL_CAR', label: '렌터카', children: [] },
      { id: 'AUTO_SERVICE', label: '자동차/이륜차 정비', children: [] },
      { id: 'DELIVERY', label: '운송/배달/택배', children: [] },
      { id: 'PHOTO', label: '사진/스튜디오', children: [] },
      { id: 'PRINT', label: '광고/인쇄', children: [] },
      { id: 'WEDDING', label: '예식/의례', children: [] },
      { id: 'EVENT', label: '행사/이벤트', children: [] },
    ]
  },
  {
    id: 'ENTERTAINMENT',
    label: '오락·여가',
    icon: Gamepad2,
    children: [
      { id: 'PC', label: 'PC방', children: [] },
      { id: 'ARCADE', label: '오락/당구/볼링', children: [] },
      { id: 'KARAOKE', label: '노래방/멀티방', children: [] },
      { id: 'FITNESS', label: '헬스클럽/스포츠센터', children: [] },
      { id: 'PILATES', label: '필라테스/요가', children: [] },
      { id: 'MASSAGE', label: '마사지/스파', children: [] },
      { id: 'THEATER', label: '연극/영화/극장', children: [] },
      { id: 'EXHIBITION', label: '전시/관람', children: [] },
    ]
  },
  {
    id: 'EDUCATION',
    label: '교육·학습',
    icon: GraduationCap,
    children: [
      { id: 'STUDY', label: '도서관/독서실/스터디카페', children: [] },
      { id: 'KINDERGARTEN', label: '유아교육', children: [] },
      { id: 'ACADEMY_STUDY', label: '학원-보습/입시', children: [] },
      { id: 'ACADEMY_LANG', label: '학원-어학', children: [] },
      { id: 'ACADEMY_ART', label: '학원-음악/미술/무용', children: [] },
      { id: 'ACADEMY_SPORTS', label: '학원-예능/취미/체육', children: [] },
      { id: 'ACADEMY_CERT', label: '학원-자격/국가고시', children: [] },
      { id: 'ACADEMY_JOB', label: '학원-창업/취업', children: [] },
    ]
  },
  {
    id: 'LODGING',
    label: '숙박',
    icon: BedDouble,
    children: [
      { id: 'HOTEL', label: '호텔', children: [] },
      { id: 'MOTEL', label: '모텔', children: [] },
      { id: 'PENSION', label: '펜션/민박', children: [] },
      { id: 'GUESTHOUSE', label: '게스트하우스', children: [] },
    ]
  },
  {
    id: 'AUTO',
    label: '자동차',
    icon: Car,
    children: [
      { id: 'CAR_WASH', label: '세차장', children: [] },
      { id: 'CAR_REPAIR', label: '정비소', children: [] },
      { id: 'CAR_PARTS', label: '부품/용품', children: [] },
    ]
  },
  {
    id: 'OFFICE',
    label: '사무·오피스',
    icon: Building2,
    children: [
      { id: 'COWORKING', label: '공유오피스', children: [] },
      { id: 'OFFICE_RENTAL', label: '사무실 임대', children: [] },
    ]
  }
];

// 2. 오픈 프로세스 태스크 (체크리스트용) - [최신 기획 반영]
export const OPEN_TASK_CATEGORIES: OpenTaskCategory[] = [
  { id: 'CONSULTING', label: '컨설팅', description: '입지 분석부터 예산 진단까지' },
  { id: 'CONSTRUCTION', label: '공사/정리', description: '철거부터 인테리어, 청소까지' },
  { id: 'OPERATION', label: '운영 준비', description: '매장 운영 필수 인프라' },
  { id: 'OPENING_LITE', label: '오프닝 패키지', description: '비용 절감의 핵심 솔루션' },
];

export const OPEN_PROCESS_TASKS: OpenTaskItem[] = [
  // 0. 컨설팅 (입지/분석/예산)
  { id: 'location_search', category: 'CONSULTING', title: '입지 탐색', description: '업종 기준 상권 적합도, 비교, 리스크 경고', iconType: 'map' },
  { id: 'location_analysis', category: 'CONSULTING', title: '상권 분석', description: '유동인구, 경쟁업체, 배후수요 분석', iconType: 'chart' },
  { id: 'permit_guide', category: 'CONSULTING', title: '인허가/행정 가이드', description: '업종별 점포 가능 여부, 불가/주의/추가조건 안내', iconType: 'clipboard' },
  { id: 'total_cost', category: 'CONSULTING', title: '예상 창업 총액', description: '철거, 원상복구, 보증금/권리금 기회비용 포함', iconType: 'calculator' },
  { id: 'real_estate', category: 'CONSULTING', title: '부동산 중개', description: '전문 부동산 연결 및 계약 지원', iconType: 'building' },

  // 1. 공사/정리
  { id: 'demolition', category: 'CONSTRUCTION', title: '철거', description: '기존 시설 철거 및 폐기물 처리', iconType: 'hammer' },
  { id: 'restoration', category: 'CONSTRUCTION', title: '원상복구', description: '계약 종료 시 원상복구 리스크 점검', iconType: 'refresh' },
  { id: 'interior', category: 'CONSTRUCTION', title: '인테리어 시공', description: '업종별 맞춤 설계 및 시공', iconType: 'paint' },
  { id: 'signage', category: 'CONSTRUCTION', title: '간판/사인물', description: '외부 간판, 내부 사인물, LED 등', iconType: 'sign' },
  { id: 'cleaning', category: 'CONSTRUCTION', title: '전문 청소', description: '준공/입주 딥클리닝', iconType: 'sparkles' },

  // 2. 운영 준비
  { id: 'internet', category: 'OPERATION', title: '인터넷', description: '업소용 인터넷 설치', iconType: 'wifi' },
  { id: 'cctv', category: 'OPERATION', title: 'CCTV', description: '보안 카메라 설치 및 모니터링', iconType: 'camera' },
  { id: 'pos', category: 'OPERATION', title: 'POS/키오스크', description: '결제 시스템 및 주문 단말기', iconType: 'tablet' },
  { id: 'insurance_fire', category: 'OPERATION', title: '화재 보험', description: '필수 화재 보험 가입', iconType: 'shield' },
  { id: 'insurance_liability', category: 'OPERATION', title: '배상책임 보험', description: '영업배상책임 보험 가입', iconType: 'shield' },
  { id: 'beverage', category: 'OPERATION', title: '음료 도매', description: '음료 공급업체 매칭', iconType: 'coffee' },
  { id: 'liquor', category: 'OPERATION', title: '주류 도매', description: '주류사 최저가 매칭', iconType: 'wine' },
  { id: 'delivery_setup', category: 'OPERATION', title: '배달 대행', description: '권역 세팅 + 배민/요기요 등 업체 컨택', iconType: 'bike' },
  { id: 'delivery_photo', category: 'OPERATION', title: '배달 서비스 사진', description: '메뉴 사진 촬영 및 시안 제작', iconType: 'image' },
  { id: 'menu_photo', category: 'OPERATION', title: '메뉴판/홍보물', description: '메뉴판, 전단지, 현수막 제작', iconType: 'file' },

  // 3. 오프닝 패키지 (핵심)
  { id: 'used_package', category: 'OPENING_LITE', title: '중고 가구/집기 패키지', description: 'A급 검수 자재 + 설치', iconType: 'box', isOpeningExclusive: true },
  { id: 'consulting_premium', category: 'OPENING_LITE', title: '프리미엄 컨설팅', description: '예산/구성 최적화 1:1 진단', iconType: 'user', isOpeningExclusive: true },
  { id: '3d_link', category: 'OPENING_LITE', title: '3D 인테리어 시안', description: '미리보는 배치 체험', iconType: 'cube', isOpeningExclusive: true },
  { id: 'turnkey', category: 'OPENING_LITE', title: '턴키 패키지', description: '상담부터 오픈까지 원스톱 솔루션', iconType: 'rocket', isOpeningExclusive: true },
];

// Helper to create mock products
const createProduct = (name: string, category: string, w: number, d: number, h: number, price: number = 0, grade: ItemGrade = ItemGrade.A): Product => ({
  id: `p_${Math.random().toString(36).substr(2, 9)}`,
  name, category, width: w, depth: d, height: h, price, grade, 
  utility: {electric:false, water:false, gas:false, vent:false}, 
  image: '', 
  clearance: {front:0, side:0}
});

// 3. 통합 매물 데이터 (25개 - 홈 화면 및 매물 탭용)
export const MOCK_OPENING_PACKAGES: Package[] = [
  // --- [EDUCATION] ---
  {
    id: 'pkg_edu_001', source: 'OPENING',
    name: '강남 프리미엄 스터디카페 20평형 (A급)',
    description: '프리미엄 독서실 폐업 자재, 상태 최상. 시디즈 의자 40개, 1인실 책상 포함.',
    businessType: 'EDUCATION',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000',
    items: [createProduct('1인실 책상', 'FURNITURE', 100, 60, 120, 150000)],
    totalPrice: 15000000, location: '서울 강남구', leadTimeDays: 7, has3D: true, badges: ['오프닝 검수', '설치포함'], grade: 'A', warranty: '6개월', tags: ['study', 'gangnam', 'today']
  },
  {
    id: 'pkg_edu_002', source: 'USER',
    name: '보습학원 15평 강의실 집기 일괄',
    description: '책걸상 세트 30조, 화이트보드 2개, 강연대 1개. 상태 깨끗함.',
    businessType: 'EDUCATION',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1000',
    items: [], totalPrice: 1200000, location: '경기 성남시', leadTimeDays: 5, has3D: false, badges: ['직거래', '가구위주'], grade: 'B', warranty: '없음', deadline: 'D-10', hopePrice: 1000000, tags: ['academy', 'bundang', 'cheap']
  },
  {
    id: 'pkg_edu_003', source: 'USER',
    name: '미술학원 이젤 및 수납장 정리',
    description: '원목 이젤 20개, 물감 정리함, 작업대. 폐업 정리합니다.',
    businessType: 'EDUCATION',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000',
    items: [], totalPrice: 800000, location: '서울 마포구', leadTimeDays: 3, has3D: false, badges: ['직거래', '급처'], grade: 'C', warranty: '없음', deadline: 'D-3', hopePrice: 500000, tags: ['art', 'urgent']
  },

  // --- [CAFE] ---
  {
    id: 'pkg_cafe_001', source: 'OPENING',
    name: '성수동 감성 카페 15평 (B급 가성비)',
    description: '우드톤 인테리어 가구 일체. 라마르조꼬 머신 포함.',
    businessType: 'CAFE',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1000',
    items: [createProduct('에스프레소 머신', 'KITCHEN', 80, 60, 50, 4500000)],
    totalPrice: 12000000, location: '서울 성동구', leadTimeDays: 14, has3D: true, badges: ['오프닝 검수', '철거포함'], grade: 'B', warranty: '3개월', tags: ['cafe', 'seongsu', 'today']
  },
  {
    id: 'pkg_cafe_003', source: 'USER',
    name: '디저트 카페 쇼케이스 및 오븐',
    description: '900 사이즈 제과 쇼케이스(사각), 스메그 오븐 4단.',
    businessType: 'CAFE',
    image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=1000',
    items: [], totalPrice: 3200000, location: '서울 용산구', leadTimeDays: 5, has3D: false, badges: ['직거래', '상태좋음'], grade: 'A', warranty: '없음', deadline: 'D-14', hopePrice: 3000000, tags: ['cafe', 'dessert']
  },

  // --- [PUB] ---
  {
    id: 'pkg_pub_001', source: 'OPENING',
    name: '홍대 펍/바 12평 패키지 (주방 설비 특화)',
    description: '업소용 냉장고, 제빙기, 4구 간택기, 식기세척기 포함.',
    businessType: 'PUB',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=1000',
    items: [], totalPrice: 18500000, location: '서울 마포구', leadTimeDays: 7, has3D: true, badges: ['오프닝 검수', '빠른설치'], grade: 'A', warranty: '3개월', tags: ['pub', 'hongdae', 'kitchen']
  },
  {
    id: 'pkg_pub_002', source: 'USER',
    name: '이자카야 다찌(Bar) 테이블 및 목재 인테리어',
    description: '히노끼 스타일 다찌 상판, 목재 파티션, 조명 일괄 양도.',
    businessType: 'PUB',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1000',
    items: [], totalPrice: 3000000, location: '서울 관악구', leadTimeDays: 20, has3D: false, badges: ['직거래', '인테리어포함'], grade: 'B', warranty: '없음', deadline: 'D-14', hopePrice: 2500000, tags: ['izakaya', 'wood']
  },
  {
    id: 'pkg_pub_004', source: 'USER',
    name: '와인바 럭셔리 소파 및 조명',
    description: '벨벳 소파 6조, 샹들리에 조명 3개, 와인잔 랙.',
    businessType: 'PUB',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000',
    items: [], totalPrice: 4500000, location: '서울 강남구', leadTimeDays: 14, has3D: false, badges: ['직거래', '고급'], grade: 'A', warranty: '없음', deadline: 'D-30', hopePrice: 4000000, tags: ['wine', 'luxury']
  },

  // --- [RETAIL] ---
  {
    id: 'pkg_retail_001', source: 'USER',
    name: '동네 분식집 급처분 (집기 일괄)',
    description: '운영 6개월차. 떡볶이 다이, 튀김기, 순대 찜기 등 일괄.',
    businessType: 'RETAIL',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=1000',
    items: [], totalPrice: 5000000, location: '서울 강서구', leadTimeDays: 3, has3D: false, badges: ['직거래', '빠른회수'], grade: 'C', warranty: '없음', deadline: 'D-5', hopePrice: 5000000, tags: ['snack', 'urgent', 'cheap']
  },
  {
    id: 'pkg_retail_002', source: 'OPENING',
    name: '편의점/마트 진열대(곤돌라) 20개 세트',
    description: '화이트 철제 곤돌라(양면/단면 혼합). 워크인 쿨러 도어 4짝.',
    businessType: 'RETAIL',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1000',
    items: [], totalPrice: 4500000, location: '경기 김포시', leadTimeDays: 7, has3D: true, badges: ['오프닝 검수', '설치지원'], grade: 'A', warranty: '6개월', tags: ['retail', 'cvs', 'shelf']
  },
  {
    id: 'pkg_retail_003', source: 'USER',
    name: '옷가게 행거 및 전신거울, 마네킹',
    description: '골드 프레임 행거 10개, 대형 전신거울 2개, 마네킹 5개.',
    businessType: 'RETAIL',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000',
    items: [], totalPrice: 1500000, location: '서울 마포구', leadTimeDays: 7, has3D: false, badges: ['직거래', '소량'], grade: 'A', warranty: '없음', deadline: 'D-7', hopePrice: 1200000, tags: ['clothing', 'interior', 'today']
  },

  // --- [BEAUTY] ---
  {
    id: 'pkg_beauty_001', source: 'USER',
    name: '네일샵 테이블 및 의자 정리',
    description: '흡진기 내장 테이블, 시술 의자, 패디 의자 1개.',
    businessType: 'BEAUTY',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=1000',
    items: [], totalPrice: 2000000, location: '서울 마포구', leadTimeDays: 5, has3D: false, badges: ['직거래', '소량'], grade: 'B', warranty: '없음', deadline: 'D-2', hopePrice: 1800000, tags: ['beauty', 'nail', 'urgent']
  },
  {
    id: 'pkg_beauty_002', source: 'OPENING',
    name: '미용실 경대/의자 3세트 패키지',
    description: '골드 프레임 팔각 거울 경대 3개, 전동 미용 의자 3개.',
    businessType: 'BEAUTY',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000',
    items: [], totalPrice: 5500000, location: '서울 강남구', leadTimeDays: 10, has3D: true, badges: ['오프닝 검수', '설치포함'], grade: 'A', warranty: '1년', tags: ['hair', 'premium', 'today']
  },

  // --- [FITNESS] ---
  {
    id: 'pkg_fit_001', source: 'OPENING',
    name: '필라테스 스튜디오 30평 기구 일괄 (S급)',
    description: '리포머, 캐딜락, 체어, 바렐 풀세트 4조 (인투필라테스).',
    businessType: 'FITNESS',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=1000',
    items: [createProduct('콤비 리포머', 'EQUIPMENT', 80, 240, 180, 1500000)],
    totalPrice: 25000000, location: '서울 송파구', leadTimeDays: 10, has3D: true, badges: ['오프닝 검수', '설치포함'], grade: 'A', warranty: '1년', tags: ['pilates', 'large', 'today']
  },
  {
    id: 'pkg_fit_002', source: 'USER',
    name: 'PT샵 운동기구 정리 (렉, 덤벨, 벤치)',
    description: '파워렉 1대, 스미스머신 1대, 덤벨 세트, 벤치 2개.',
    businessType: 'FITNESS',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000',
    items: [], totalPrice: 4500000, location: '경기 안양시', leadTimeDays: 14, has3D: false, badges: ['직거래', '운반별도'], grade: 'B', warranty: '없음', deadline: 'D-20', hopePrice: 4000000, tags: ['gym', 'pt']
  },

  // --- [OTHER] ---
  {
    id: 'pkg_other_001', source: 'OPENING',
    name: '셀프 사진관(스튜디오) 장비 세트',
    description: '조명(스트로보) 2조, 배경지 전동 시스템, 키오스크.',
    businessType: 'OTHER',
    image: 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?q=80&w=1000',
    items: [], totalPrice: 6500000, location: '서울 마포구', leadTimeDays: 7, has3D: false, badges: ['오프닝 검수', '설치지원'], grade: 'A', warranty: '6개월', tags: ['photo', 'studio']
  },
];

// 3. 사용자 직거래 리스트 (홈 화면용 필터링 로직)
// tags에 'today'나 'urgent'가 있거나 source가 USER인 것을 기본으로 가져오되,
// HomeView 컴포넌트 내부에서 탭(today, quick 등)에 따라 2차 필터링을 합니다.
export const MOCK_USER_LISTINGS = MOCK_OPENING_PACKAGES.filter(p => 
  p.source === 'USER' || p.tags?.includes('today') || p.tags?.includes('urgent')
);

// 4. 비용 상수
export const LOGISTICS_BASE_COST = 200000;
export const INSTALLATION_BASE_COST = 300000;

// 5. 상담 옵션
export const MOCK_CONSULTING_OPTIONS: ConsultingOption[] = [
  {
    id: 'c_quick',
    title: '빠른 검증 (30분)',
    durationMin: 30,
    price: 30000,
    description: '아이디어/상권 초기 진단. 전화 또는 화상.',
    isOnline: true,
  },
  {
    id: 'c_standard',
    title: '구성/동선 확정 (60분)',
    durationMin: 60,
    price: 99000,
    description: '도면 기반 상세 배치 및 설비 체크. 화상 미팅.',
    isOnline: true,
  },
  {
    id: 'c_site',
    title: '현장 실측 동행',
    durationMin: 90,
    price: 250000,
    description: '전문가 현장 방문. 실측 및 인테리어 조언.',
    isOnline: false,
  }
];
