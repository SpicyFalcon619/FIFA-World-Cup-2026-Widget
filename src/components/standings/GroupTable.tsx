import { Group, useWC2026Store } from '../../store/wc2026Store';

export function GroupTable({ group }: { group: Group }) {
  const setSelectedTeam = useWC2026Store(s => s.setSelectedTeam);

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-[var(--text-primary)]">
        {group.name}
      </h3>
      <div 
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] text-[var(--text-muted)] uppercase bg-black/20 border-b border-[var(--border-glass)]">
              <th className="px-2 py-1.5 font-medium w-6 text-center">#</th>
              <th className="px-2 py-1.5 font-medium">Team</th>
              <th className="px-1 py-1.5 font-medium text-center w-6">P</th>
              <th className="px-1 py-1.5 font-medium text-center w-6">W</th>
              <th className="px-1 py-1.5 font-medium text-center w-6">D</th>
              <th className="px-1 py-1.5 font-medium text-center w-6">L</th>
              <th className="px-1 py-1.5 font-medium text-center w-8">GD</th>
              <th className="px-2 py-1.5 font-bold text-center w-8 text-white">Pts</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {group.standings.map((team, idx) => (
              <tr 
                key={team.team} 
                onClick={() => setSelectedTeam(team.team)}
                className={`border-b border-[var(--border-glass)] last:border-0 cursor-pointer hover:bg-white/4 transition-colors ${idx < 2 ? 'bg-green-500/5' : ''}`}
              >
                <td className={`px-2 py-2 text-center font-mono ${idx < 2 ? 'border-l-2 border-[var(--accent-green)]' : 'border-l-2 border-transparent'}`}>
                  {team.position}
                </td>
                <td className="px-2 py-2 font-medium flex items-center gap-2">
                  {team.flag ? (
                    <img src={team.flag} alt={team.team} className="w-5 h-5 object-contain drop-shadow-sm" />
                  ) : (
                    <div className="w-5 h-5 rounded-[2px] bg-white/20 blur-[1px] shadow-sm border border-white/10" />
                  )}
                  <span className="truncate max-w-[90px]" title={team.team}>{team.team}</span>
                </td>
                <td className="px-1 py-2 text-center text-[var(--text-muted)]">{team.played}</td>
                <td className="px-1 py-2 text-center text-[var(--text-muted)]">{team.won}</td>
                <td className="px-1 py-2 text-center text-[var(--text-muted)]">{team.drawn}</td>
                <td className="px-1 py-2 text-center text-[var(--text-muted)]">{team.lost}</td>
                <td className="px-1 py-2 text-center font-mono">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                <td className="px-2 py-2 text-center font-bold text-[var(--text-primary)]">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
