import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db as localDb } from './db';
import { db as firestore } from './firebase';
import { Store } from './types';

export async function uploadToCloud(storeId: string): Promise<void> {
  if (!storeId) throw new Error("ID de l'établissement manquant.");

  // Fetch all local data
  const [
    products,
    sales,
    staff,
    pendingOrders,
    purchases,
    metadata
  ] = await Promise.all([
    localDb.products.toArray(),
    localDb.sales.toArray(),
    localDb.staff.toArray(),
    localDb.pendingOrders.toArray(),
    localDb.purchases.toArray(),
    localDb.metadata.toArray()
  ]);

  const timestamp = new Date().toISOString();

  // Save as documents in Firestore under stores/{storeId}/tables/{tableName}
  const tableData = [
    { name: 'products', list: products },
    { name: 'sales', list: sales },
    { name: 'staff', list: staff },
    { name: 'pendingOrders', list: pendingOrders },
    { name: 'purchases', list: purchases },
    { name: 'metadata', list: metadata }
  ];

  for (const table of tableData) {
    const docRef = doc(firestore, 'stores', storeId, 'tables', table.name);
    await setDoc(docRef, {
      list: table.list,
      updatedAt: timestamp
    });
  }

  // Also update store summary in main document
  const storeDocRef = doc(firestore, 'stores', storeId);
  const bistroStore = metadata.find(m => m.key === 'bistro_store')?.value;
  const currentCode = bistroStore?.activationCode || "123456";
  await setDoc(storeDocRef, {
    id: storeId,
    name: bistroStore?.name || "Mon Bistro",
    activationCode: currentCode,
    staffAccessCode: bistroStore?.staffAccessCode || "2410",
    lastSyncedAt: timestamp
  }, { merge: true });

  // Map activation code in activation_codes collection for instant cross-terminal lookup
  if (currentCode) {
    const codeDocRef = doc(firestore, 'activation_codes', currentCode);
    await setDoc(codeDocRef, {
      storeId: storeId,
      activationCode: currentCode,
      updatedAt: timestamp
    }, { merge: true });
  }
}

export async function syncStoreCodeToCloud(store: Store): Promise<void> {
  if (!store || !store.id) return;
  try {
    const timestamp = new Date().toISOString();
    const storeDocRef = doc(firestore, 'stores', store.id);
    await setDoc(storeDocRef, {
      id: store.id,
      name: store.name || "Mon Bistro",
      activationCode: store.activationCode,
      staffAccessCode: store.staffAccessCode || "2410",
      lastSyncedAt: timestamp
    }, { merge: true });

    if (store.activationCode) {
      const codeDocRef = doc(firestore, 'activation_codes', store.activationCode);
      await setDoc(codeDocRef, {
        storeId: store.id,
        activationCode: store.activationCode,
        updatedAt: timestamp
      }, { merge: true });
    }
  } catch (err) {
    console.error("Erreur sync code vers cloud:", err);
  }
}

export async function verifyActivationCodeOnline(inputCode: string): Promise<string | null> {
  if (!inputCode) return null;

  try {
    // 1. Direct doc lookup in activation_codes/{inputCode}
    const codeDocRef = doc(firestore, 'activation_codes', inputCode);
    const codeSnap = await getDoc(codeDocRef);
    if (codeSnap.exists()) {
      const data = codeSnap.data();
      if (data.storeId) {
        const downloaded = await downloadFromCloud(data.storeId);
        if (downloaded) return data.storeId;
      }
    }

    // 2. Query stores where activationCode == inputCode
    const storesRef = collection(firestore, 'stores');
    const q = query(storesRef, where('activationCode', '==', inputCode));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const storeDoc = querySnapshot.docs[0];
      const storeId = storeDoc.id;
      const downloaded = await downloadFromCloud(storeId);
      if (downloaded) return storeId;
    }
  } catch (err) {
    console.error("Erreur vérification code en ligne:", err);
  }

  return null;
}

export async function downloadFromCloud(storeId: string): Promise<boolean> {
  if (!storeId) throw new Error("ID de l'établissement manquant.");

  const tables = ['products', 'sales', 'staff', 'pendingOrders', 'purchases', 'metadata'];
  const pulledData: Record<string, any[]> = {};

  // Check if main store exists first
  const storeDocRef = doc(firestore, 'stores', storeId);
  const storeSnap = await getDoc(storeDocRef);
  if (!storeSnap.exists()) {
    return false;
  }

  // Fetch all tables
  for (const tableName of tables) {
    const docRef = doc(firestore, 'stores', storeId, 'tables', tableName);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      pulledData[tableName] = snap.data().list || [];
    } else {
      pulledData[tableName] = [];
    }
  }

  // Restore into IndexedDB inside a transaction
  await (localDb as any).transaction('rw', [
    localDb.products,
    localDb.sales,
    localDb.staff,
    localDb.pendingOrders,
    localDb.purchases,
    localDb.metadata
  ], async () => {
    await localDb.products.clear();
    if (pulledData.products?.length) await localDb.products.bulkAdd(pulledData.products);

    await localDb.sales.clear();
    if (pulledData.sales?.length) await localDb.sales.bulkAdd(pulledData.sales);

    await localDb.staff.clear();
    if (pulledData.staff?.length) await localDb.staff.bulkAdd(pulledData.staff);

    await localDb.pendingOrders.clear();
    if (pulledData.pendingOrders?.length) await localDb.pendingOrders.bulkAdd(pulledData.pendingOrders);

    await localDb.purchases.clear();
    if (pulledData.purchases?.length) await localDb.purchases.bulkAdd(pulledData.purchases);

    await localDb.metadata.clear();
    if (pulledData.metadata?.length) await localDb.metadata.bulkAdd(pulledData.metadata);
  });

  return true;
}
