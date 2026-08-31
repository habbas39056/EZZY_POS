import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Factory, 
  Globe, 
  FolderTree, 
  Scale, 
  Package, 
  MapPin, 
  Plus, 
  Trash2, 
  Pencil,
  MoreVertical,
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  HelpCircle,
  ArrowUpDown
} from 'lucide-react';
import type { 
  Department, 
  Manufacturer, 
  Region, 
  Category, 
  UnitOfMeasure, 
  Location,
  Product 
} from '../../../types/catalog';
import { 
  INITIAL_DEPARTMENTS, 
  INITIAL_MANUFACTURERS, 
  INITIAL_REGIONS, 
  INITIAL_CATEGORIES, 
  INITIAL_UOM, 
  INITIAL_LOCATIONS,
  INITIAL_PRODUCTS
} from '../../../types/catalog';
import { AddDepartmentView } from './AddDepartmentView';
import { AddManufacturerView } from './AddManufacturerView';
import { AddRegionView } from './AddRegionView';
import { AddCategoryView } from './AddCategoryView';
import { AddLocationView } from './AddLocationView';
import { AddProductView } from './AddProductView';
import { api } from '../../../services/api';
import { ProductsListView } from './ProductsListView';

export type CatalogSubTab = 'department' | 'manufacturer' | 'region' | 'category' | 'uom' | 'product' | 'location';

interface CatalogManagerViewProps {
  initialTab?: CatalogSubTab;
  currencyCode?: string;
  currencySymbol?: string;
  onNavigateToProduct?: () => void;
}

export const CatalogManagerView: React.FC<CatalogManagerViewProps> = ({ 
  initialTab = 'department',
  currencyCode = 'PKR',
  currencySymbol = 'Rs'
}) => {
  const [activeTab, setActiveTab] = useState<CatalogSubTab>(initialTab);

  // Sync active tab when clicking sidebar items
  React.useEffect(() => {
    setActiveTab(initialTab);
    setIsAddingDepartment(false);
    setIsAddingManufacturer(false);
    setIsAddingRegion(false);
    setIsAddingCategory(false);
    setIsAddingLocation(false);
    setIsAddingProduct(false);
    setSearchQuery('');
  }, [initialTab]);
  
  // Dedicated form views
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [isAddingManufacturer, setIsAddingManufacturer] = useState(false);
  const [isAddingRegion, setIsAddingRegion] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [activeRegionMenuId, setActiveRegionMenuId] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [activeLocationMenuId, setActiveLocationMenuId] = useState<string | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // General add item modal state for UOM
  const [genericAddModal, setGenericAddModal] = useState<string | null>(null);
  const [genericItemName, setGenericItemName] = useState('');
  const [genericItemCode, setGenericItemCode] = useState('');

  // Datasets stored in localStorage
  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('adwiselabs_catalog_departments');
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [manufacturers, setManufacturers] = useState<Manufacturer[]>(() => {
    const saved = localStorage.getItem('adwiselabs_catalog_manufacturers');
    return saved ? JSON.parse(saved) : INITIAL_MANUFACTURERS;
  });

  const [regions, setRegions] = useState<Region[]>(() => {
    const saved = localStorage.getItem('adwiselabs_catalog_regions');
    return saved ? JSON.parse(saved) : INITIAL_REGIONS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('adwiselabs_catalog_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [uomList, setUomList] = useState<UnitOfMeasure[]>(() => {
    const saved = localStorage.getItem('adwiselabs_catalog_uom');
    return saved ? JSON.parse(saved) : INITIAL_UOM;
  });

  const [locations, setLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem('adwiselabs_catalog_locations');
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('adwiselabs_catalog_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  useEffect(() => {
    const loadAllCatalogData = async () => {
      try {
        const [cats, depts, mfgs, regs, uoms, locs, prods] = await Promise.all([
          api.getCategories(),
          api.getDepartments(),
          api.getManufacturers(),
          api.getRegions(),
          api.getUom(),
          api.getLocations(),
          api.getProducts()
        ]);
        if (cats && Array.isArray(cats) && cats.length > 0) {
          setCategories(cats);
          localStorage.setItem('adwiselabs_catalog_categories', JSON.stringify(cats));
        }
        if (depts && Array.isArray(depts) && depts.length > 0) {
          setDepartments(depts);
          localStorage.setItem('adwiselabs_catalog_departments', JSON.stringify(depts));
        }
        if (mfgs && Array.isArray(mfgs) && mfgs.length > 0) {
          setManufacturers(mfgs);
          localStorage.setItem('adwiselabs_catalog_manufacturers', JSON.stringify(mfgs));
        }
        if (regs && Array.isArray(regs) && regs.length > 0) {
          setRegions(regs);
          localStorage.setItem('adwiselabs_catalog_regions', JSON.stringify(regs));
        }
        if (uoms && Array.isArray(uoms) && uoms.length > 0) {
          setUomList(uoms);
          localStorage.setItem('adwiselabs_catalog_uom', JSON.stringify(uoms));
        }
        if (locs && Array.isArray(locs) && locs.length > 0) {
          setLocations(locs);
          localStorage.setItem('adwiselabs_catalog_locations', JSON.stringify(locs));
        }
        if (prods && Array.isArray(prods) && prods.length > 0) {
          setProducts(prev => {
            const remoteIds = new Set(prods.map(p => p.id));
            const localOnly = prev.filter(p => !remoteIds.has(p.id));
            const merged = [...localOnly, ...prods];
            localStorage.setItem('adwiselabs_catalog_products', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (e) {}
    };
    loadAllCatalogData();
  }, []);

  // Search filter & pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);

  // Persistence helpers
  const saveDepartments = (data: Department[]) => {
    setDepartments(data);
    localStorage.setItem('adwiselabs_catalog_departments', JSON.stringify(data));
  };

  const saveManufacturers = (data: Manufacturer[]) => {
    setManufacturers(data);
    localStorage.setItem('adwiselabs_catalog_manufacturers', JSON.stringify(data));
  };

  const saveRegions = (data: Region[]) => {
    setRegions(data);
    localStorage.setItem('adwiselabs_catalog_regions', JSON.stringify(data));
  };

  const saveCategories = (data: Category[]) => {
    setCategories(data);
    localStorage.setItem('adwiselabs_catalog_categories', JSON.stringify(data));
  };

  const saveUom = (data: UnitOfMeasure[]) => {
    setUomList(data);
    localStorage.setItem('adwiselabs_catalog_uom', JSON.stringify(data));
  };

  const saveLocations = (data: Location[]) => {
    setLocations(data);
    localStorage.setItem('adwiselabs_catalog_locations', JSON.stringify(data));
  };

  const saveProducts = (data: Product[]) => {
    setProducts(data);
    localStorage.setItem('adwiselabs_catalog_products', JSON.stringify(data));
  };

  const getFormattedDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Add & Delete Handlers
  const handleSaveDepartment = (name: string) => {
    const newDept: Department = {
      id: `dept_${Date.now()}`,
      name,
      createdOn: getFormattedDate()
    };
    saveDepartments([newDept, ...departments]);
    api.saveDepartment(newDept).catch(() => {});
    setIsAddingDepartment(false);
  };

  const handleDeleteDepartment = (id: string) => {
    saveDepartments(departments.filter(d => d.id !== id));
    api.deleteDepartment(id).catch(() => {});
  };

  const handleSaveManufacturer = (name: string) => {
    const newMfg: Manufacturer = {
      id: `mfg_${Date.now()}`,
      name,
      createdOn: getFormattedDate()
    };
    saveManufacturers([newMfg, ...manufacturers]);
    api.saveManufacturer(newMfg).catch(() => {});
    setIsAddingManufacturer(false);
  };

  const handleDeleteManufacturer = (id: string) => {
    saveManufacturers(manufacturers.filter(m => m.id !== id));
    api.deleteManufacturer(id).catch(() => {});
  };

  const handleSaveRegion = (name: string, parentRegion?: string) => {
    if (editingRegion) {
      const updatedItem = { ...editingRegion, name, parentRegion: parentRegion || '' };
      const updated = regions.map(r => r.id === editingRegion.id ? updatedItem : r);
      saveRegions(updated);
      api.saveRegion(updatedItem).catch(() => {});
      setEditingRegion(null);
    } else {
      const newReg: Region = {
        id: `reg_${Date.now()}`,
        name,
        parentRegion: parentRegion || '',
        createdOn: getFormattedDate()
      };
      saveRegions([newReg, ...regions]);
      api.saveRegion(newReg).catch(() => {});
    }
    setIsAddingRegion(false);
  };

  const handleDeleteRegion = (id: string) => {
    saveRegions(regions.filter(r => r.id !== id));
    api.deleteRegion(id).catch(() => {});
  };

  const handleSaveCategory = (name: string, departmentName?: string, image?: string) => {
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name,
      departmentName: departmentName || '',
      image: image || '',
      createdOn: getFormattedDate()
    };
    saveCategories([newCat, ...categories]);
    api.saveCategory(newCat).catch(() => {});
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = (id: string) => {
    saveCategories(categories.filter(c => c.id !== id));
    api.deleteCategory(id).catch(() => {});
  };

  const handleSaveLocation = (name: string, parentLocation?: string) => {
    if (editingLocation) {
      const updatedItem = { ...editingLocation, name, parentLocation: parentLocation || '' };
      const updated = locations.map(l => l.id === editingLocation.id ? updatedItem : l);
      saveLocations(updated);
      api.saveLocation(updatedItem).catch(() => {});
      setEditingLocation(null);
    } else {
      const newLoc: Location = {
        id: `loc_${Date.now()}`,
        name,
        parentLocation: parentLocation || '',
        createdOn: getFormattedDate()
      };
      saveLocations([newLoc, ...locations]);
      api.saveLocation(newLoc).catch(() => {});
    }
    setIsAddingLocation(false);
  };

  const handleDeleteLocation = (id: string) => {
    saveLocations(locations.filter(l => l.id !== id));
    api.deleteLocation(id).catch(() => {});
  };

  const handleSaveProduct = async (prodData: Omit<Product, 'id' | 'createdOn'>) => {
    const newProd: Product = {
      ...prodData,
      id: `prod_${Date.now()}`,
      createdOn: getFormattedDate()
    };
    const updated = [newProd, ...products];
    saveProducts(updated);
    try {
      await api.saveProduct(newProd);
    } catch (e) {
      console.warn('API save failed, saved locally:', e);
    }
    setIsAddingProduct(false);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const updated = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    saveProducts(updated);
    api.saveProduct(updatedProduct).catch(() => {});
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    saveProducts(updated);
    api.deleteProduct(id).catch(() => {});
  };

  const handleBulkAddProducts = (newProducts: Product[]) => {
    const updated = [...newProducts, ...products];
    saveProducts(updated);
  };

  // Generic UOM Add
  const handleSaveGenericItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genericItemName.trim()) return;
    const formattedDate = getFormattedDate();

    if (activeTab === 'uom') {
      const newItem: UnitOfMeasure = {
        id: `uom_${Date.now()}`,
        name: genericItemName.trim(),
        symbol: genericItemCode.trim() || genericItemName.trim(),
        createdOn: formattedDate
      };
      saveUom([newItem, ...uomList]);
      api.saveUom(newItem).catch(() => {});
    }

    setGenericAddModal(null);
    setGenericItemName('');
    setGenericItemCode('');
  };

  const handleDeleteUom = (id: string) => {
    saveUom(uomList.filter(u => u.id !== id));
    api.deleteUom(id).catch(() => {});
  };

  // Render Dedicated Form Views
  if (isAddingDepartment) {
    return (
      <AddDepartmentView
        onSave={handleSaveDepartment}
        onCancel={() => setIsAddingDepartment(false)}
      />
    );
  }

  if (isAddingManufacturer) {
    return (
      <AddManufacturerView
        onSave={handleSaveManufacturer}
        onCancel={() => setIsAddingManufacturer(false)}
      />
    );
  }

  if (isAddingRegion) {
    return (
      <AddRegionView
        existingRegions={regions}
        initialRegion={editingRegion}
        onSave={handleSaveRegion}
        onCancel={() => {
          setEditingRegion(null);
          setIsAddingRegion(false);
        }}
      />
    );
  }

  if (isAddingCategory) {
    return (
      <AddCategoryView
        departments={departments}
        onSave={handleSaveCategory}
        onCancel={() => setIsAddingCategory(false)}
      />
    );
  }

  if (isAddingLocation) {
    return (
      <AddLocationView
        existingLocations={locations}
        initialLocation={editingLocation}
        onSave={handleSaveLocation}
        onCancel={() => {
          setEditingLocation(null);
          setIsAddingLocation(false);
        }}
      />
    );
  }

  if (isAddingProduct) {
    return (
      <AddProductView
        categories={categories}
        locations={locations}
        manufacturers={manufacturers}
        uomList={uomList}
        onSave={handleSaveProduct}
        onCancel={() => setIsAddingProduct(false)}
      />
    );
  }

  // Filtered lists
  const filteredDepartments = departments.filter(d => 
    !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredManufacturers = manufacturers.filter(m => 
    !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || (m.code && m.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredRegions = regions.filter(r => 
    !searchQuery || 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (r.parentRegion && r.parentRegion.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCategories = categories.filter(c => 
    !searchQuery || 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.departmentName && c.departmentName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredUom = uomList.filter(u => 
    !searchQuery || u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLocations = locations.filter(l => 
    !searchQuery || 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.parentLocation && l.parentLocation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-3 font-sans text-xs text-slate-700 select-none">
      {/* ======================================================== */}
      {/* 🧭 TOP HORIZONTAL SUB-TABS (MATCHING SCREENSHOTS)        */}
      {/* ======================================================== */}
      <div className="bg-[#e9edf2] border-b border-slate-300 -mx-4 -mt-4 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-0.5 overflow-x-auto text-xs font-semibold py-1">
          {/* Department */}
          <button
            onClick={() => { setActiveTab('department'); setSearchQuery(''); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'department'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Department</span>
          </button>

          {/* Manufacturer */}
          <button
            onClick={() => { setActiveTab('manufacturer'); setSearchQuery(''); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'manufacturer'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Factory className="w-3.5 h-3.5 text-slate-500" />
            <span>Manufacturer</span>
          </button>

          {/* Region */}
          <button
            onClick={() => { setActiveTab('region'); setSearchQuery(''); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'region'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Region</span>
          </button>

          {/* Category */}
          <button
            onClick={() => { setActiveTab('category'); setSearchQuery(''); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'category'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5 text-slate-500" />
            <span>Category</span>
          </button>

          {/* Unit of Measures */}
          <button
            onClick={() => { setActiveTab('uom'); setSearchQuery(''); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'uom'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-slate-500" />
            <span>Unit of Measures</span>
          </button>

          {/* Product */}
          <button
            onClick={() => { setActiveTab('product'); setSearchQuery(''); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'product'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-slate-500" />
            <span>Product</span>
          </button>

          {/* Location */}
          <button
            onClick={() => { setActiveTab('location'); setSearchQuery(''); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'location'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>Location</span>
          </button>
        </div>

        <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-700 cursor-pointer" />
      </div>

      {/* Product sub-view */}
      {activeTab === 'product' ? (
        <ProductsListView
          products={products}
          categories={categories}
          locations={locations}
          manufacturers={manufacturers}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onBulkAddProducts={handleBulkAddProducts}
          currencyCode={currencyCode}
          currencySymbol={currencySymbol}
          onOpenAddProduct={() => setIsAddingProduct(true)}
          onTabChange={(tab) => setActiveTab(tab as any)}
        />
      ) : (
        /* Standard Catalog Sub-Modules Table */
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mt-3">
          {/* Header Bar */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 capitalize">
                {activeTab === 'uom' ? 'Unit of Measures' : 
                 activeTab === 'region' ? 'Regions' :
                 activeTab === 'manufacturer' ? 'Manufacturers' :
                 activeTab === 'location' ? 'Locations' :
                 activeTab === 'category' ? 'Categories' :
                 `${activeTab}s`}
              </h2>
              {activeTab === 'region' && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Manage region hierarchy for transaction and reporting.
                </p>
              )}
              {activeTab === 'location' && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Manage location hierarchy for inventory and operational transactions.
                </p>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {activeTab === 'department' ? (
                <button
                  onClick={() => setIsAddingDepartment(true)}
                  className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded transition flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Department
                </button>
              ) : activeTab === 'manufacturer' ? (
                <button
                  onClick={() => setIsAddingManufacturer(true)}
                  className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded transition flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Manufacturer
                </button>
              ) : activeTab === 'region' ? (
                <button
                  onClick={() => setIsAddingRegion(true)}
                  className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded transition flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Add Region
                </button>
              ) : activeTab === 'category' ? (
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded transition flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Category
                </button>
              ) : activeTab === 'location' ? (
                <button
                  onClick={() => setIsAddingLocation(true)}
                  className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded transition flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Add Location
                </button>
              ) : (
                <button
                  onClick={() => setGenericAddModal(activeTab)}
                  className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded transition flex items-center gap-1 shadow-xs capitalize"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> {activeTab}
                </button>
              )}
            </div>
          </div>

          {/* Right Search Input */}
          <div className="px-5 py-2.5 bg-slate-50/50 border-b border-slate-100 flex justify-end">
            <div className="w-72 relative">
              <input
                type="text"
                placeholder={
                  activeTab === 'region' ? 'Search region or parent region' : 
                  activeTab === 'location' ? 'Search location or parent location' : 
                  'Search'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white placeholder-slate-400"
              />
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto min-h-[350px]">
            {/* 1. DEPARTMENTS TABLE */}
            {activeTab === 'department' && (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-white border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="px-5 py-2.5">Name</th>
                    <th className="px-5 py-2.5">Created On</th>
                    <th className="px-5 py-2.5 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {filteredDepartments.map(dept => (
                    <tr key={dept.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3 font-semibold text-slate-800">{dept.name}</td>
                      <td className="px-5 py-3 text-slate-500 font-mono text-[10.5px]">{dept.createdOn}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDeleteDepartment(dept.id)}
                          className="p-1 rounded hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 2. MANUFACTURERS TABLE (SCREENSHOT 1) */}
            {activeTab === 'manufacturer' && (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-white border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="px-5 py-2.5 flex items-center gap-1 cursor-pointer">
                      <span>Name</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </th>
                    <th className="px-5 py-2.5">Created On</th>
                    <th className="px-5 py-2.5 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {filteredManufacturers.map(mfg => (
                    <tr key={mfg.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3 font-semibold text-slate-800">{mfg.name}</td>
                      <td className="px-5 py-3 text-slate-500 font-mono text-[10.5px]">{mfg.createdOn}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDeleteManufacturer(mfg.id)}
                          className="p-1 rounded hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 3. REGIONS TABLE (SCREENSHOT 3) */}
            {activeTab === 'region' && (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-white border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="px-5 py-2.5">Name</th>
                    <th className="px-5 py-2.5">Parent Region</th>
                    <th className="px-5 py-2.5">Created On</th>
                    <th className="px-5 py-2.5 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {filteredRegions.map(reg => (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition relative">
                      <td className="px-5 py-3 font-semibold text-slate-800">{reg.name}</td>
                      <td className="px-5 py-3 text-slate-600 font-medium">
                        {reg.parentRegion || '-'}
                      </td>
                      <td className="px-5 py-3 text-slate-500 font-mono text-[10.5px]">{reg.createdOn}</td>
                      <td className="px-5 py-3 text-center relative">
                        <button
                          onClick={() => setActiveRegionMenuId(activeRegionMenuId === reg.id ? null : reg.id)}
                          className="p-1 rounded-md text-sky-700 hover:text-slate-900 hover:bg-slate-100 transition inline-flex items-center justify-center font-bold text-sm tracking-widest cursor-pointer"
                          title="Region Actions"
                        >
                          •••
                        </button>

                        {/* Dropdown Menu matching screenshot */}
                        {activeRegionMenuId === reg.id && (
                          <div className="absolute right-4 top-8 w-28 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-left text-xs">
                            <button
                              onClick={() => {
                                setEditingRegion(reg);
                                setIsAddingRegion(true);
                                setActiveRegionMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5 text-slate-600" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${reg.name}"?`)) {
                                  handleDeleteRegion(reg.id);
                                }
                                setActiveRegionMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-slate-600" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 4. CATEGORIES TABLE (SCREENSHOT 1) */}
            {activeTab === 'category' && (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-white border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="px-5 py-2.5">Name</th>
                    <th className="px-5 py-2.5">Created On</th>
                    <th className="px-5 py-2.5">Department</th>
                    <th className="px-5 py-2.5 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {filteredCategories.map(cat => (
                    <tr key={cat.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        <div className="flex items-center gap-2.5">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-6 h-6 rounded object-contain bg-slate-50 border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                              <FolderTree className="w-3 h-3" />
                            </div>
                          )}
                          <span>{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-500 font-mono text-[10.5px]">{cat.createdOn}</td>
                      <td className="px-5 py-3 text-slate-600 font-medium">
                        {cat.departmentName || '-'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1 rounded hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 5. UNIT OF MEASURES TABLE */}
            {activeTab === 'uom' && (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-white border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="px-5 py-2.5">Unit Name</th>
                    <th className="px-5 py-2.5">Symbol</th>
                    <th className="px-5 py-2.5">Created On</th>
                    <th className="px-5 py-2.5 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {filteredUom.map(uom => (
                    <tr key={uom.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3 font-semibold text-slate-800">{uom.name}</td>
                      <td className="px-5 py-3 text-slate-500 font-mono font-bold text-emerald-700">{uom.symbol}</td>
                      <td className="px-5 py-3 text-slate-500 font-mono">{uom.createdOn}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDeleteUom(uom.id)}
                          className="p-1 rounded hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 6. LOCATIONS TABLE (SCREENSHOT 3) */}
            {activeTab === 'location' && (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-white border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="px-5 py-2.5">Name</th>
                    <th className="px-5 py-2.5">Parent Location</th>
                    <th className="px-5 py-2.5">Created On</th>
                    <th className="px-5 py-2.5 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {filteredLocations.map(loc => (
                    <tr key={loc.id} className="hover:bg-slate-50/80 transition relative">
                      <td className="px-5 py-3 font-semibold text-slate-800">{loc.name}</td>
                      <td className="px-5 py-3 text-slate-600 font-medium">
                        {loc.parentLocation || '-'}
                      </td>
                      <td className="px-5 py-3 text-slate-500 font-mono text-[10.5px]">{loc.createdOn}</td>
                      <td className="px-5 py-3 text-center relative">
                        <button
                          onClick={() => setActiveLocationMenuId(activeLocationMenuId === loc.id ? null : loc.id)}
                          className="p-1 rounded-md text-sky-700 hover:text-slate-900 hover:bg-slate-100 transition inline-flex items-center justify-center font-bold text-sm tracking-widest cursor-pointer"
                          title="Location Actions"
                        >
                          •••
                        </button>

                        {/* Actions Dropdown matching screenshot */}
                        {activeLocationMenuId === loc.id && (
                          <div className="absolute right-4 top-8 w-28 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-left text-xs">
                            <button
                              onClick={() => {
                                setEditingLocation(loc);
                                setIsAddingLocation(true);
                                setActiveLocationMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5 text-slate-600" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${loc.name}"?`)) {
                                  handleDeleteLocation(loc.id);
                                }
                                setActiveLocationMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-slate-600" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-end space-x-4 text-[11px] text-slate-500">
            <div className="flex items-center space-x-1.5">
              <span>Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-slate-200 rounded px-1.5 py-0.5 bg-white text-slate-700 font-semibold"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div>
              1 - {activeTab === 'department' ? departments.length : 
                   activeTab === 'manufacturer' ? manufacturers.length :
                   activeTab === 'region' ? regions.length :
                   activeTab === 'category' ? categories.length :
                   activeTab === 'uom' ? uomList.length : locations.length} of {
                   activeTab === 'department' ? departments.length : 
                   activeTab === 'manufacturer' ? manufacturers.length :
                   activeTab === 'region' ? regions.length :
                   activeTab === 'category' ? categories.length :
                   activeTab === 'uom' ? uomList.length : locations.length
              }
            </div>

            <div className="flex items-center space-x-1 text-slate-400">
              <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Add Item Modal (UOM) */}
      {genericAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm capitalize">
                Add {genericAddModal}
              </h3>
              <button onClick={() => setGenericAddModal(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGenericItem} className="p-5 space-y-3.5">
              <div>
                <label className="block text-slate-600 font-medium mb-1 capitalize">
                  {genericAddModal} Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={genericItemName}
                  onChange={(e) => setGenericItemName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              {genericAddModal === 'uom' && (
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Unit Symbol (e.g. Pcs, Kg, Wp)
                  </label>
                  <input
                    type="text"
                    value={genericItemCode}
                    onChange={(e) => setGenericItemCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGenericAddModal(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded shadow-xs"
                >
                  Add {genericAddModal}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
