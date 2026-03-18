'use client';

import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import type { CricketBatsmanStats, CricketBowlerStats, Team } from '@/types/sports-data';

interface CricketPlayerStatsTableProps {
  battingStats: {
    home: CricketBatsmanStats[];
    away: CricketBatsmanStats[];
  };
  bowlingStats: {
    home: CricketBowlerStats[];
    away: CricketBowlerStats[];
  };
  homeTeam: Team;
  awayTeam: Team;
}

type BatsmanWithTeam = CricketBatsmanStats & { team: 'home' | 'away' };
type BowlerWithTeam = CricketBowlerStats & { team: 'home' | 'away' };

/**
 * Cricket player statistics table component.
 * Displays batting and bowling stats in sortable table format using @tanstack/react-table.
 *
 * Batting Columns: Player, R (runs), B (balls), 4s, 6s, SR (strike rate)
 * Bowling Columns: Player, O (overs), M (maidens), R (runs), W (wickets), Econ
 */
export function CricketPlayerStatsTable({
  battingStats,
  bowlingStats,
  homeTeam,
  awayTeam,
}: CricketPlayerStatsTableProps) {
  const [activeTab, setActiveTab] = useState<'batting' | 'bowling'>('batting');

  return (
    <div className="bg-[#16162a] rounded-xl border border-purple-500/10 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-purple-500/10">
        <button
          onClick={() => setActiveTab('batting')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'batting'
              ? 'bg-purple-500/20 text-purple-300 border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-white hover:bg-purple-500/10'
          }`}
        >
          Batting Stats
        </button>
        <button
          onClick={() => setActiveTab('bowling')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'bowling'
              ? 'bg-purple-500/20 text-purple-300 border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-white hover:bg-purple-500/10'
          }`}
        >
          Bowling Stats
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'batting' ? (
          <BattingStatsTable
            homeStats={battingStats.home}
            awayStats={battingStats.away}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />
        ) : (
          <BowlingStatsTable
            homeStats={bowlingStats.home}
            awayStats={bowlingStats.away}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />
        )}
      </div>
    </div>
  );
}

function BattingStatsTable({
  homeStats,
  awayStats,
  homeTeam,
  awayTeam,
}: {
  homeStats: CricketBatsmanStats[];
  awayStats: CricketBatsmanStats[];
  homeTeam: Team;
  awayTeam: Team;
}) {
  // Combine data with team identifier
  const data: BatsmanWithTeam[] = [
    ...homeStats.map((p) => ({ ...p, team: 'home' as const })),
    ...awayStats.map((p) => ({ ...p, team: 'away' as const })),
  ];

  // Define column definitions
  const columns: ColumnDef<BatsmanWithTeam>[] = [
    {
      id: 'player',
      header: 'Batsman',
      accessorFn: (row) => row.name,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className={row.original.isNotOut ? 'text-green-400' : 'text-white'}>
            {row.original.name}
          </span>
          {row.original.isOnStrike && (
            <span className="text-yellow-400 text-xs">*</span>
          )}
        </div>
      ),
      enableSorting: false,
    },
    {
      id: 'runs',
      header: 'R',
      accessorKey: 'runs',
      sortDescFirst: true,
      cell: ({ getValue }) => (
        <span className="font-bold text-white">{getValue() as number}</span>
      ),
    },
    {
      id: 'balls',
      header: 'B',
      accessorKey: 'balls',
      sortDescFirst: true,
    },
    {
      id: 'fours',
      header: '4s',
      accessorKey: 'fours',
      sortDescFirst: true,
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return value > 0 ? (
          <span className="text-blue-400">{value}</span>
        ) : (
          <span className="text-gray-500">{value}</span>
        );
      },
    },
    {
      id: 'sixes',
      header: '6s',
      accessorKey: 'sixes',
      sortDescFirst: true,
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return value > 0 ? (
          <span className="text-green-400">{value}</span>
        ) : (
          <span className="text-gray-500">{value}</span>
        );
      },
    },
    {
      id: 'strikeRate',
      header: 'SR',
      accessorKey: 'strikeRate',
      sortDescFirst: true,
      cell: ({ getValue }) => (
        <span className="text-purple-300">{(getValue() as number).toFixed(1)}</span>
      ),
    },
  ];

  // Set initial sorting state: default sort by runs descending
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'runs', desc: true },
  ]);

  // Initialize table
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-purple-500/20">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 text-left text-xs font-semibold text-gray-400 cursor-pointer hover:text-purple-300 transition-colors"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() && (
                    <span className="ml-1">
                      {header.column.getIsSorted() === 'desc' ? '▼' : '▲'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, index) => {
            // Check if this is the first away team player (insert divider before)
            const isFirstAwayPlayer =
              row.original.team === 'away' &&
              (index === 0 ||
                table.getRowModel().rows[index - 1]?.original.team === 'home');

            return (
              <React.Fragment key={row.id}>
                {index === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-3 py-2 bg-purple-500/10 text-xs font-semibold text-purple-300"
                    >
                      {homeTeam.name}
                    </td>
                  </tr>
                )}
                {isFirstAwayPlayer && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-3 py-2 bg-purple-500/10 text-xs font-semibold text-purple-300 border-t border-purple-500/20"
                    >
                      {awayTeam.name}
                    </td>
                  </tr>
                )}
                <tr className="border-b border-gray-800/50 hover:bg-purple-500/5">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-3 py-2 whitespace-nowrap text-gray-300"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BowlingStatsTable({
  homeStats,
  awayStats,
  homeTeam,
  awayTeam,
}: {
  homeStats: CricketBowlerStats[];
  awayStats: CricketBowlerStats[];
  homeTeam: Team;
  awayTeam: Team;
}) {
  // Combine data with team identifier
  const data: BowlerWithTeam[] = [
    ...homeStats.map((p) => ({ ...p, team: 'home' as const })),
    ...awayStats.map((p) => ({ ...p, team: 'away' as const })),
  ];

  // Define column definitions
  const columns: ColumnDef<BowlerWithTeam>[] = [
    {
      id: 'player',
      header: 'Bowler',
      accessorFn: (row) => row.name,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-white">{row.original.name}</span>
          {row.original.isBowling && (
            <span className="text-yellow-400 text-xs">*</span>
          )}
        </div>
      ),
      enableSorting: false,
    },
    {
      id: 'overs',
      header: 'O',
      accessorKey: 'overs',
      sortDescFirst: true,
    },
    {
      id: 'maidens',
      header: 'M',
      accessorKey: 'maidens',
      sortDescFirst: true,
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return value > 0 ? (
          <span className="text-green-400">{value}</span>
        ) : (
          <span className="text-gray-500">{value}</span>
        );
      },
    },
    {
      id: 'runs',
      header: 'R',
      accessorKey: 'runs',
      sortDescFirst: false, // Lower runs is better
    },
    {
      id: 'wickets',
      header: 'W',
      accessorKey: 'wickets',
      sortDescFirst: true,
      cell: ({ getValue }) => (
        <span className="font-bold text-white">{getValue() as number}</span>
      ),
    },
    {
      id: 'economy',
      header: 'Econ',
      accessorKey: 'economy',
      sortDescFirst: false, // Lower economy is better
      cell: ({ getValue }) => {
        const value = getValue() as number;
        const colorClass = value < 6 ? 'text-green-400' : value > 10 ? 'text-red-400' : 'text-purple-300';
        return <span className={colorClass}>{value.toFixed(1)}</span>;
      },
    },
  ];

  // Set initial sorting state: default sort by wickets descending
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'wickets', desc: true },
  ]);

  // Initialize table
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-purple-500/20">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 text-left text-xs font-semibold text-gray-400 cursor-pointer hover:text-purple-300 transition-colors"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() && (
                    <span className="ml-1">
                      {header.column.getIsSorted() === 'desc' ? '▼' : '▲'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, index) => {
            // Check if this is the first away team player (insert divider before)
            const isFirstAwayPlayer =
              row.original.team === 'away' &&
              (index === 0 ||
                table.getRowModel().rows[index - 1]?.original.team === 'home');

            return (
              <React.Fragment key={row.id}>
                {index === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-3 py-2 bg-purple-500/10 text-xs font-semibold text-purple-300"
                    >
                      {homeTeam.name}
                    </td>
                  </tr>
                )}
                {isFirstAwayPlayer && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-3 py-2 bg-purple-500/10 text-xs font-semibold text-purple-300 border-t border-purple-500/20"
                    >
                      {awayTeam.name}
                    </td>
                  </tr>
                )}
                <tr className="border-b border-gray-800/50 hover:bg-purple-500/5">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-3 py-2 whitespace-nowrap text-gray-300"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
