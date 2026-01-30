import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Button } from './Components';
import {
  Plus, Edit2, Trash2, Save, X, Building2, Phone, Mail,
  DollarSign, Tag, Search, Filter, ChevronDown, ChevronUp,
  Users, TrendingUp, Package, Settings, LogOut, Home,
  Hammer, PaintBucket, SignpostBig, Wifi, Shield, Bike,
  Truck, Store, Sparkles, Wind
} from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  description: string;
  price_min: number;
  price_max: number;
  price_unit: string;
  commission_rate: number;
  service_area: string[];
  is_active: boolean;
  created_at: string;
}

interface AdminViewProps {
  onLogout: () => void;
}

// 협력업체 카테고리
const PARTNER_CATEGORIES = [
  { id: 'construction', label: '공사/시설', icon: Hammer, subcategories: ['철거', '인테리어', '간판', '전기', '가스', '환기'] },
  { id: 'equipment', label: '장비/집기', icon: Package, subcategories: ['주방장비', '가구', '냉장설비', 'POS'] },
  { id: 'operation', label: '운영지원', icon: Settings, subcategories: ['청소', 'CCTV/보안', '인터넷/통신', '보험'] },
  { id: 'logistics', label: '물류/배달', icon: Truck, subcategories: ['배달대행', '물류', '원재료공급'] },
  { id: 'marketing', label: '마케팅', icon: TrendingUp, subcategories: ['배달앱입점', 'SNS마케팅', '간판/사인물'] },
];

export const AdminView: React.FC<AdminViewProps> = ({ onLogout }) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  // 통계
  const [stats, setStats] = useState({
    totalPartners: 0,
    activePartners: 0,
    totalProjects: 0,
    monthlyRevenue: 0
  });

  // 새 협력업체 폼
  const [formData, setFormData] = useState<Partial<Partner>>({
    name: '',
    category: '',
    subcategory: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    description: '',
    price_min: 0,
    price_max: 0,
    price_unit: '만원',
    commission_rate: 10,
    service_area: ['강남구'],
    is_active: true
  });

  useEffect(() => {
    loadPartners();
    loadStats();
  }, []);

  const loadPartners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('category', { ascending: true });

    if (data) {
      setPartners(data);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    // 통계 로드
    const { data: partnerCount } = await supabase
      .from('partners')
      .select('id', { count: 'exact' });

    const { data: projectCount } = await supabase
      .from('startup_projects')
      .select('id', { count: 'exact' });

    setStats({
      totalPartners: partnerCount?.length || 0,
      activePartners: partners.filter(p => p.is_active).length,
      totalProjects: projectCount?.length || 0,
      monthlyRevenue: 0 // 추후 계산
    });
  };

  const savePartner = async () => {
    if (!formData.name || !formData.category) {
      alert('업체명과 카테고리는 필수입니다.');
      return;
    }

    if (editingPartner) {
      // 수정
      const { error } = await supabase
        .from('partners')
        .update(formData)
        .eq('id', editingPartner.id);

      if (error) {
        console.error('Error updating partner:', error);
        alert('수정 실패: ' + error.message);
        return;
      }
    } else {
      // 신규 추가
      const { error } = await supabase
        .from('partners')
        .insert([formData]);

      if (error) {
        console.error('Error adding partner:', error);
        alert('추가 실패: ' + error.message);
        return;
      }
    }

    setShowAddModal(false);
    setEditingPartner(null);
    resetForm();
    loadPartners();
  };

  const deletePartner = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const { error } = await supabase
      .from('partners')
      .delete()
      .eq('id', id);

    if (!error) {
      loadPartners();
    }
  };

  const togglePartnerActive = async (partner: Partner) => {
    const { error } = await supabase
      .from('partners')
      .update({ is_active: !partner.is_active })
      .eq('id', partner.id);

    if (!error) {
      loadPartners();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      description: '',
      price_min: 0,
      price_max: 0,
      price_unit: '만원',
      commission_rate: 10,
      service_area: ['강남구'],
      is_active: true
    });
  };

  const openEditModal = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData(partner);
    setShowAddModal(true);
  };

  const filteredPartners = partners.filter(p => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-slate-900 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/favicon-new.png" alt="오프닝" className="w-10 h-10 rounded-xl" />
            <div>
              <h1 className="text-xl font-bold">오프닝 관리자</h1>
              <p className="text-sm text-slate-400">협력업체 관리 시스템</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      </header>

      <div className="flex">
        {/* 사이드바 */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-72px)] p-4">
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-brand-50 text-brand-700 rounded-lg font-bold">
              <Building2 size={20} />
              협력업체 관리
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Users size={20} />
              프로젝트 현황
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <TrendingUp size={20} />
              수수료 정산
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Settings size={20} />
              설정
            </button>
          </nav>

          {/* 통계 */}
          <div className="mt-8 p-4 bg-slate-50 rounded-xl">
            <h3 className="font-bold text-sm text-slate-700 mb-3">현황</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">협력업체</span>
                <span className="font-bold">{partners.length}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">활성</span>
                <span className="font-bold text-green-600">{partners.filter(p => p.is_active).length}개</span>
              </div>
            </div>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6">
          {/* 상단 액션 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="업체명 검색..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border rounded-lg"
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
              >
                <option value="">전체 카테고리</option>
                {PARTNER_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            <Button onClick={() => { resetForm(); setEditingPartner(null); setShowAddModal(true); }}>
              <Plus size={18} className="mr-2" />
              협력업체 추가
            </Button>
          </div>

          {/* 카테고리 탭 */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${
                !selectedCategory ? 'bg-slate-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              전체 ({partners.length})
            </button>
            {PARTNER_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const count = partners.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                    selectedCategory === cat.id ? 'bg-slate-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* 협력업체 목록 */}
          {loading ? (
            <div className="text-center py-20 text-gray-500">로딩 중...</div>
          ) : filteredPartners.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border">
              <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="font-bold text-gray-700 mb-2">등록된 협력업체가 없습니다</h3>
              <p className="text-gray-500 text-sm mb-4">협력업체를 추가하여 시작하세요</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus size={18} className="mr-2" />
                협력업체 추가
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">업체명</th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">카테고리</th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">담당자</th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">가격</th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">수수료</th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">상태</th>
                    <th className="text-right px-4 py-3 text-sm font-bold text-gray-700">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPartners.map(partner => (
                    <tr key={partner.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-bold text-slate-900">{partner.name}</p>
                          <p className="text-xs text-gray-500">{partner.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {PARTNER_CATEGORIES.find(c => c.id === partner.category)?.label || partner.category}
                        </span>
                        {partner.subcategory && (
                          <span className="ml-1 px-2 py-1 bg-brand-50 text-brand-700 rounded text-xs font-medium">
                            {partner.subcategory}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm">{partner.contact_name}</p>
                        <p className="text-xs text-gray-500">{partner.contact_phone}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium">
                          {partner.price_min.toLocaleString()} ~ {partner.price_max.toLocaleString()}{partner.price_unit}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-brand-600">{partner.commission_rate}%</span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => togglePartnerActive(partner)}
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            partner.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {partner.is_active ? '활성' : '비활성'}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => openEditModal(partner)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deletePartner(partner.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* 추가/수정 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingPartner ? '협력업체 수정' : '협력업체 추가'}
              </h2>
              <button onClick={() => { setShowAddModal(false); setEditingPartner(null); }} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* 기본 정보 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">업체명 *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">카테고리 *</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                  >
                    <option value="">선택</option>
                    {PARTNER_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">세부 카테고리</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    disabled={!formData.category}
                  >
                    <option value="">선택</option>
                    {PARTNER_CATEGORIES.find(c => c.id === formData.category)?.subcategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">설명</label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg resize-none h-20"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="업체 소개 및 특징..."
                />
              </div>

              {/* 담당자 정보 */}
              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-700 mb-3">담당자 정보</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">담당자명</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">연락처</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">이메일</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* 가격 정보 */}
              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-700 mb-3">가격 및 수수료</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">최소 가격</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.price_min}
                      onChange={(e) => setFormData({ ...formData, price_min: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">최대 가격</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.price_max}
                      onChange={(e) => setFormData({ ...formData, price_max: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">단위</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.price_unit}
                      onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })}
                    >
                      <option value="만원">만원</option>
                      <option value="평당 만원">평당 만원</option>
                      <option value="월 만원">월 만원</option>
                      <option value="연 만원">연 만원</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">수수료율 (%)</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.commission_rate}
                      onChange={(e) => setFormData({ ...formData, commission_rate: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {/* 서비스 지역 */}
              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-700 mb-3">서비스 지역</h3>
                <div className="flex flex-wrap gap-2">
                  {['강남구', '서초구', '송파구', '강동구', '마포구', '용산구', '성동구', '광진구'].map(area => (
                    <button
                      key={area}
                      onClick={() => {
                        const areas = formData.service_area || [];
                        if (areas.includes(area)) {
                          setFormData({ ...formData, service_area: areas.filter(a => a !== area) });
                        } else {
                          setFormData({ ...formData, service_area: [...areas, area] });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        formData.service_area?.includes(area)
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowAddModal(false); setEditingPartner(null); }}>
                취소
              </Button>
              <Button onClick={savePartner}>
                <Save size={18} className="mr-2" />
                {editingPartner ? '수정' : '추가'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
