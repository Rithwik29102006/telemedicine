import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp, Medicine } from '../../contexts/AppContext';
import { ArrowLeft, Plus, Edit, Trash2, Package } from 'lucide-react';
import styles from './InventoryManager.module.css';

interface InventoryManagerProps {
  onBack: () => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { state: appState, addMedicine, updateMedicine, deleteMedicine } = useApp();
  const [isAddingMedicine, setIsAddingMedicine] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: '',
    expiryDate: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const medicineData = {
      name: formData.name,
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price),
      expiryDate: new Date(formData.expiryDate)
    };

    if (editingMedicine) {
      await updateMedicine({
        ...medicineData,
        id: editingMedicine.id
      });
      setEditingMedicine(null);
    } else {
      await addMedicine(medicineData);
      setIsAddingMedicine(false);
    }

    setFormData({ name: '', quantity: '', price: '', expiryDate: '' });
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      quantity: medicine.quantity.toString(),
      price: medicine.price.toString(),
      expiryDate: medicine.expiryDate.toISOString().split('T')[0]
    });
    setIsAddingMedicine(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      await deleteMedicine(id);
    }
  };

  const cancelForm = () => {
    setIsAddingMedicine(false);
    setEditingMedicine(null);
    setFormData({ name: '', quantity: '', price: '', expiryDate: '' });
  };

  return (
    <div className={styles.inventoryManager}>
      <div className={styles.header}>
        <button className="btn btn-outline" onClick={onBack}>
          <ArrowLeft size={20} />
          {t('back')}
        </button>
        <h2>{t('inventory')}</h2>
        {!isAddingMedicine && (
          <button 
            className="btn btn-primary"
            onClick={() => setIsAddingMedicine(true)}
          >
            <Plus size={20} />
            Add Medicine
          </button>
        )}
      </div>

      {isAddingMedicine && (
        <div className="card">
          <div className={styles.formContent}>
            <h3>{editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    {t('medicineName')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="quantity" className="form-label">
                    {t('quantity')} *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="form-input"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label htmlFor="price" className="form-label">
                    {t('price')} *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="form-input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="expiryDate" className="form-label">
                    {t('expiryDate')} *
                  </label>
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className="btn btn-outline" onClick={cancelForm}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-success">
                  {editingMedicine ? t('save') : t('add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.inventoryList}>
        {appState.medicines.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={48} />
            <h3>No medicines in inventory</h3>
            <p>Add medicines to your inventory to get started</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {appState.medicines.map(medicine => (
              <div key={medicine.id} className="card">
                <div className={styles.medicineCard}>
                  <div className={styles.medicineInfo}>
                    <h4>{medicine.name}</h4>
                    <div className={styles.medicineDetails}>
                      <p>
                        <span className={styles.label}>Quantity:</span>
                        <span className={medicine.quantity < 10 ? styles.lowStock : ''}>
                          {medicine.quantity}
                        </span>
                      </p>
                      <p>
                        <span className={styles.label}>Price:</span>
                        ${medicine.price.toFixed(2)}
                      </p>
                      <p>
                        <span className={styles.label}>Expires:</span>
                        {medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    
                    {medicine.quantity < 10 && (
                      <div className="badge badge-warning">Low Stock</div>
                    )}
                  </div>
                  
                  <div className={styles.medicineActions}>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleEdit(medicine)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(medicine.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManager;