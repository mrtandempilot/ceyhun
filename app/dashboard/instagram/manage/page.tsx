'use client';

import { useState, useEffect } from 'react';
import { Instagram, Link, RefreshCw, Unlink, Edit, CheckCircle, XCircle } from 'lucide-react';

interface LinkageData {
  instagram_id: string;
  username: string | null;
  customer_name: string | null;
  customer_email: string | null;
  contact_id: string | null;
  linked_first_name: string | null;
  linked_last_name: string | null;
  linked_email: string | null;
  linked_phone: string | null;
  last_message_at: string;
}

export default function InstagramManagePage() {
  const [linkages, setLinkages] = useState<LinkageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlinking, setUnlinking] = useState<string | null>(null);

  const fetchLinkages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/instagram/manage-links');
      if (!response.ok) throw new Error('Failed to fetch linkages');
      const data = await response.json();
      setLinkages(data.linkages || []);
    } catch (error) {
      console.error('Error fetching linkages:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlinkCustomer = async (instagramId: string) => {
    if (!confirm('Are you sure you want to unlink this Instagram user from the customer?')) return;
    
    setUnlinking(instagramId);
    try {
      const response = await fetch('/api/instagram/manage-links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instagram_id: instagramId }),
      });

      if (!response.ok) throw new Error('Failed to unlink');
      
      alert('Successfully unlinked!');
      fetchLinkages();
    } catch (error) {
      console.error('Error unlinking:', error);
      alert('Failed to unlink. Please try again.');
    } finally {
      setUnlinking(null);
    }
  };

  useEffect(() => {
    fetchLinkages();
  }, []);

  const getStatusBadge = (linkage: LinkageData) => {
    if (linkage.contact_id && linkage.linked_email) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          <CheckCircle className="w-3 h-3" />
          Linked
        </span>
      );
    } else if (linkage.customer_email) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
          <Edit className="w-3 h-3" />
          Email Only
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
          <XCircle className="w-3 h-3" />
          Not Linked
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Instagram className="w-8 h-8 text-pink-500" />
            Instagram Customer Management
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage Instagram user to customer linkages
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">All Instagram Linkages</h2>
            <button
              onClick={fetchLinkages}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instagram Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stored Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Linked Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading...
                    </td>
                  </tr>
                ) : linkages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No Instagram conversations found
                    </td>
                  </tr>
                ) : (
                  linkages.map((linkage) => (
                    <tr key={linkage.instagram_id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            @{linkage.username || 'unknown'}
                          </span>
                          <span className="text-xs text-gray-500">
                            ID: ...{linkage.instagram_id.slice(-8)}
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            {new Date(linkage.last_message_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          {linkage.customer_name && (
                            <span className="text-sm text-gray-900">{linkage.customer_name}</span>
                          )}
                          {linkage.customer_email && (
                            <span className="text-xs text-blue-600">{linkage.customer_email}</span>
                          )}
                          {!linkage.customer_name && !linkage.customer_email && (
                            <span className="text-xs text-gray-400">No stored info</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {linkage.linked_first_name ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {linkage.linked_first_name} {linkage.linked_last_name}
                            </span>
                            <span className="text-xs text-blue-600">{linkage.linked_email}</span>
                            {linkage.linked_phone && (
                              <span className="text-xs text-green-600">{linkage.linked_phone}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Not linked to customer</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(linkage)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {linkage.contact_id && (
                            <button
                              onClick={() => unlinkCustomer(linkage.instagram_id)}
                              disabled={unlinking === linkage.instagram_id}
                              className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs transition-colors disabled:opacity-50"
                            >
                              {unlinking === linkage.instagram_id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Unlink className="w-3 h-3" />
                              )}
                              Unlink
                            </button>
                          )}
                          <a
                            href={`/dashboard/instagram?id=${linkage.instagram_id}`}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs transition-colors"
                          >
                            <Link className="w-3 h-3" />
                            Manage
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Linked</strong> = Instagram user is properly connected to a customer record</li>
            <li>• <strong>Email Only</strong> = Has email but not linked to customer database</li>
            <li>• <strong>Not Linked</strong> = No customer information available</li>
            <li>• Click <strong>Manage</strong> to go to chat and link/relink the customer</li>
            <li>• Click <strong>Unlink</strong> to remove incorrect linkages</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
