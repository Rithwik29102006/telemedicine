import React, { useState } from 'react';
import { Village } from '../../contexts/LocationContext';
import { Search, MapPin } from 'lucide-react';
import styles from './VillageDropdown.module.css';

interface VillageDropdownProps {
  villages: Village[];
  onSelect: (village: Village) => void;
}

const VillageDropdown: React.FC<VillageDropdownProps> = ({ villages, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);

  const filteredVillages = villages.filter(village =>
    village.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    village.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (village: Village) => {
    setSelectedVillage(village);
  };

  const handleConfirm = () => {
    if (selectedVillage) {
      onSelect(selectedVillage);
    }
  };

  return (
    <div className={styles.villageDropdown}>
      <div className={styles.searchContainer}>
        <Search size={16} />
        <input
          type="text"
          placeholder="Search villages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
          aria-label="Search villages"
        />
      </div>

      <div className={styles.villageList} role="listbox" aria-label="Village selection">
        {filteredVillages.length === 0 ? (
          <div className={styles.noResults}>
            No villages found matching "{searchTerm}"
          </div>
        ) : (
          filteredVillages.map(village => (
            <div
              key={village.id}
              className={`${styles.villageItem} ${selectedVillage?.id === village.id ? styles.selected : ''}`}
              onClick={() => handleSelect(village)}
              role="option"
              aria-selected={selectedVillage?.id === village.id}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(village);
                }
              }}
            >
              <MapPin size={14} />
              <div className={styles.villageInfo}>
                <span className={styles.villageName}>{village.name}</span>
                <span className={styles.villageDistrict}>{village.district}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedVillage && (
        <div className={styles.selectedInfo}>
          <p>Selected: <strong>{selectedVillage.name}, {selectedVillage.district}</strong></p>
          <button 
            className="btn btn-primary"
            onClick={handleConfirm}
          >
            Confirm Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default VillageDropdown;