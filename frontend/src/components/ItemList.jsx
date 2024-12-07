import React, { useState } from 'react';
import { useItems } from '../hooks/useItems';

export function ItemList() {
  const { items, loading, error, createItem, updateItem, deleteItem } = useItems();
  const [newItem, setNewItem] = useState({ title: '', content: '' });
  const [editItem, setEditItem] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createItem(newItem);
      setNewItem({ title: '', content: '' });
    } catch (err) {
      console.error('Failed to create item:', err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateItem(editItem.id, editItem);
      setEditItem(null);
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Items</h1>
      
      {/* Create Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Add New Item</h2>
        <div className="space-y-2">
          <input
            type="text"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            placeholder="Title"
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            value={newItem.content}
            onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
            placeholder="Content"
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Item
          </button>
        </div>
      </form>

      {/* Items List */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border p-4 rounded">
            {editItem?.id === item.id ? (
              <form onSubmit={handleUpdate}>
                <input
                  type="text"
                  value={editItem.title}
                  onChange={(e) =>
                    setEditItem({ ...editItem, title: e.target.value })
                  }
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <textarea
                  value={editItem.content}
                  onChange={(e) =>
                    setEditItem({ ...editItem, content: e.target.value })
                  }
                  className="w-full p-2 border rounded mb-2"
                />
                <div className="space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditItem(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-gray-600">{item.content}</p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => setEditItem(item)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
