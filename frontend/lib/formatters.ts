/**
 * Formatte une date en français
 * @param date - Date à formater (string, Date, ou timestamp)
 * @param includeTime - Inclure l'heure (défaut: false)
 */
export function formatDate(date: string | Date | number, includeTime: boolean = false): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Date invalide';
  
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return dateObj.toLocaleDateString('fr-FR', options);
}

/**
 * Formatte une date en format relatif (il y a X jours)
 */
export function formatRelativeDate(date: string | Date | number): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Date invalide';
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'À l\'instant';
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHour < 24) return `Il y a ${diffHour}h`;
  if (diffDay < 7) return `Il y a ${diffDay}j`;
  
  return formatDate(dateObj);
}

/**
 * Formatte un nom avec la première lettre en majuscule
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formatte un nom complet (prénom nom) avec majuscules
 */
export function formatFullName(firstName: string, lastName: string): string {
  const formattedFirst = capitalizeFirstLetter(firstName);
  const formattedLast = capitalizeFirstLetter(lastName);
  return `${formattedFirst} ${formattedLast}`.trim();
}

/**
 * Formatte une heure
 */
export function formatTime(date: string | Date | number): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Heure invalide';
  
  return dateObj.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formatte une date et heure complète
 */
export function formatDateTime(date: string | Date | number): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Date invalide';
  
  return dateObj.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
