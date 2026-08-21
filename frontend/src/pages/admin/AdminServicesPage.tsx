import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Clock, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { Service, ServiceCategory } from '../../types';
import { formatNGN } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [price, setPrice] = useState('25000');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [bufferTimeMinutes, setBufferTimeMinutes] = useState(15);
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, servs] = await Promise.all([
        api.services.getCategories(),
        api.services.list(),
      ]);
      setCategories(cats);
      setServices(servs);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setPrice('25000');
    setDurationMinutes(60);
    setBufferTimeMinutes(15);
    setShortDescription('');
    setFullDescription('');
    setIsFeatured(false);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (s: Service) => {
    setEditingService(s);
    setName(s.name);
    setCategoryId(s.category);
    setPrice(String(s.price));
    setDurationMinutes(s.duration_minutes);
    setBufferTimeMinutes(s.buffer_time_minutes);
    setShortDescription(s.short_description || '');
    setFullDescription(s.full_description || '');
    setIsFeatured(s.is_featured);
    setIsActive(s.is_active);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      category: categoryId,
      price,
      duration_minutes: durationMinutes,
      buffer_time_minutes: bufferTimeMinutes,
      short_description: shortDescription,
      full_description: fullDescription,
      is_featured: isFeatured,
      is_active: isActive,
    };

    try {
      if (editingService) {
        await api.admin.updateService(editingService.id, payload);
        success('Service Updated', `${name} details saved.`);
      } else {
        await api.admin.createService(payload);
        success('Service Created', `${name} added to catalog.`);
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Save Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center border-b border-luxury-border pb-6">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-ultra-wide text-luxury-gold font-semibold">
            Menu Configuration
          </span>
          <h1 className="font-serif text-3xl font-normal text-luxury-white mt-1">
            Services & Spa Treatments
          </h1>
        </div>
        <Button variant="gold" size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add New Treatment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => (
          <div
            key={s.id}
            className="bg-luxury-card border border-luxury-border p-6 flex flex-col justify-between space-y-4 shadow-xl hover:border-luxury-gold/50 transition-all"
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-medium">
                  {s.category_name}
                </span>
                <span className="text-xs text-luxury-muted flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{s.duration_minutes} Mins</span>
                </span>
              </div>
              <h3 className="font-serif text-xl font-medium text-luxury-white mt-1">{s.name}</h3>
              <p className="text-xs text-luxury-muted mt-2 line-clamp-2">{s.short_description}</p>
            </div>

            <div className="pt-4 border-t border-luxury-border/60 flex items-center justify-between">
              <span className="font-sans text-base font-semibold text-luxury-white">
                {formatNGN(s.price)}
              </span>
              <div className="flex space-x-2">
                <Button variant="outline-gold" size="sm" onClick={() => openEditModal(s)}>
                  Edit
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? 'Edit Treatment' : 'Add New Treatment'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Treatment Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs uppercase tracking-widest text-luxury-muted font-medium">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(parseInt(e.target.value, 10))}
                className="w-full bg-luxury-offblack text-luxury-white border border-luxury-border p-3 text-xs outline-none focus:border-luxury-gold"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Price (NGN) *"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration (Minutes) *"
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
              required
            />
            <Input
              label="Turnover Buffer (Minutes) *"
              type="number"
              value={bufferTimeMinutes}
              onChange={(e) => setBufferTimeMinutes(parseInt(e.target.value, 10))}
              required
            />
          </div>

          <Input
            label="Short Description *"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            required
          />

          <div className="space-y-1.5 text-left">
            <label className="text-xs uppercase tracking-widest text-luxury-muted font-medium">
              Full Treatment Dossier
            </label>
            <textarea
              rows={4}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              className="w-full bg-luxury-offblack text-luxury-white placeholder-luxury-darkmuted border border-luxury-border p-3 text-xs outline-none focus:border-luxury-gold"
            />
          </div>

          <div className="flex space-x-6 pt-2">
            <label className="flex items-center space-x-2 text-xs text-luxury-white cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-[#D4AF37]"
              />
              <span>Feature on Homepage</span>
            </label>
            <label className="flex items-center space-x-2 text-xs text-luxury-white cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="accent-[#D4AF37]"
              />
              <span>Active for Booking</span>
            </label>
          </div>

          <div className="pt-4 border-t border-luxury-border flex justify-end space-x-3">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" size="md" type="submit" isLoading={saving}>
              Save Treatment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
