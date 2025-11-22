/**
 * Composant Table - Tableau style Soft UI
 * 
 * Ce composant affiche un tableau avec des colonnes personnalisables,
 * des actions (éditer/supprimer) et un style Soft UI.
 * 
 * @param {Array} columns - Configuration des colonnes [{key, label, render?}]
 * @param {Array} data - Données à afficher
 * @param {Function} onEdit - Fonction appelée lors de l'édition (optionnel)
 * @param {Function} onDelete - Fonction appelée lors de la suppression (optionnel)
 * @param {boolean} loading - État de chargement
 * @param {string} className - Classes CSS supplémentaires
 */

import { Edit, Trash2 } from 'lucide-react';
import Button from '../common/Button';

function Table({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  loading = false,
  className = '',
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-soft">
        <p className="text-gray-500">Aucune donnée à afficher</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-soft overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* En-tête */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          {/* Corps */}
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
                
                {/* Actions */}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Éditer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;

