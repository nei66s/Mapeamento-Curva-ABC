'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import {
  mockComplianceChecklistItems,
  mockStoreComplianceData,
} from '@/lib/mock-data';
import type { ComplianceChecklistItem, StoreComplianceData } from '@/lib/types';
import { ComplianceChecklist } from '@/components/dashboard/compliance/compliance-checklist';
import { ComplianceSummary } from '@/components/dashboard/compliance/compliance-summary';
import { ManageChecklistItems } from '@/components/dashboard/compliance/manage-checklist-items';
import { useToast } from '@/hooks/use-toast';

export default function CompliancePage() {
  const [checklistItems, setChecklistItems] = useState<ComplianceChecklistItem[]>(
    mockComplianceChecklistItems
  );
  const [storeData, setStoreData] = useState<StoreComplianceData[]>(
    mockStoreComplianceData
  );

  const { toast } = useToast();

  const handleStatusChange = (storeId: string, itemId: string, completed: boolean) => {
    setStoreData(prevData =>
      prevData.map(store => {
        if (store.storeId === storeId) {
          return {
            ...store,
            items: store.items.map(item =>
              item.itemId === itemId ? { ...item, completed } : item
            ),
          };
        }
        return store;
      })
    );
  };
  
  const handleAddItem = (itemName: string) => {
    const newItem: ComplianceChecklistItem = {
      id: `CHK-${Date.now()}`,
      name: itemName,
    };

    setChecklistItems(prev => [...prev, newItem]);

    // Add the new item to all stores with a default status of not completed
    setStoreData(prevData =>
      prevData.map(store => ({
        ...store,
        items: [...store.items, { itemId: newItem.id, completed: false }],
      }))
    );

    toast({
      title: 'Item Adicionado!',
      description: `"${itemName}" foi adicionado ao checklist.`,
    });
  };

  const handleRemoveItem = (itemId: string) => {
    const itemToRemove = checklistItems.find(item => item.id === itemId);
    if (!itemToRemove) return;
    
    // Remove the item from the main list
    setChecklistItems(prev => prev.filter(item => item.id !== itemId));

    // Remove the item from each store's tracking data
    setStoreData(prevData =>
      prevData.map(store => ({
        ...store,
        items: store.items.filter(item => item.itemId !== itemId),
      }))
    );

    toast({
      variant: 'destructive',
      title: 'Item Removido!',
      description: `"${itemToRemove.name}" foi removido do checklist.`,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Conformidade Preventiva"
        description="Acompanhe a conclusão dos itens de manutenção essenciais em todas as lojas."
      />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <ComplianceSummary storeData={storeData} checklistItems={checklistItems} />
        </div>
        <div className="lg:col-span-1">
             <ManageChecklistItems
                items={checklistItems}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
            />
        </div>
      </div>
      
      <ComplianceChecklist
        checklistItems={checklistItems}
        storeData={storeData}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
