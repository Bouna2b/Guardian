import { ExternalLink, Trash2, FileText } from 'lucide-react';

interface Mention {
  id: string;
  source: string;
  title: string;
  snippet: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  url: string;
  date: string;
}

interface MentionsListProps {
  mentions: Mention[];
  onCreateDeletion?: (mentionId: string) => void;
}

const sentimentColors = {
  positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  neutral: 'bg-white/5 text-white/60 border-white/10',
  negative: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const sentimentLabels = {
  positive: 'Positif',
  neutral: 'Neutre',
  negative: 'À surveiller',
};

export function MentionsList({ mentions, onCreateDeletion }: MentionsListProps) {
  return (
    <div className="space-y-3">
      {mentions.map((mention) => (
        <div
          key={mention.id}
          className="rounded-lg bg-white/5 border border-white/10 p-4 hover:bg-white/[0.07] transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-white/40">{mention.source}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${sentimentColors[mention.sentiment]}`}
                >
                  {sentimentLabels[mention.sentiment]}
                </span>
              </div>
              <h4 className="text-white font-medium mb-1 truncate">{mention.title}</h4>
              <p className="text-sm text-white/60 line-clamp-2">{mention.snippet}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-white/40">{mention.date}</span>
                {mention.url && (
                  <>
                    <span className="text-white/20">•</span>
                    <a
                      href={mention.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline truncate max-w-xs"
                      title={mention.url}
                    >
                      {mention.url}
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={mention.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Ouvrir"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              {mention.sentiment === 'negative' && onCreateDeletion && (
                <button
                  onClick={() => onCreateDeletion(mention.id)}
                  className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-400 hover:text-amber-300 transition-colors"
                  title="Créer une demande de suppression"
                >
                  <FileText className="w-4 h-4" />
                </button>
              )}
              <button
                className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                title="Ignorer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
