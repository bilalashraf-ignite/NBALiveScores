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
import type { PlayerStats, Team } from '@/types/sports-data';

interface PlayerStatsTableProps {
  homeStats: PlayerStats[];
  awayStats: PlayerStats[];
  homeTeam: Team;
  awayTeam: Team;
}

type PlayerWithTeam = PlayerStats & { team: 'home' | 'away' };

export function PlayerStatsTable({
  homeStats,
  awayStats,
  homeTeam,
  awayTeam,
}: PlayerStatsTableProps) {
  // Combine data with team identifier
  const data: PlayerWithTeam[] = [
    ...homeStats.map((p) => ({ ...p, team: 'home' as const })),
    ...awayStats.map((p) => ({ ...p, team: 'away' as const })),
  ];

  // Define column definitions
  const columns: ColumnDef<PlayerWithTeam>[] = [
    {
      id: 'player',
      header: 'Player',
      accessorFn: (row) => row.lastName,
      cell: ({ row }) => `#${row.original.jerseyNumber} ${row.original.lastName}`,
      enableSorting: false,
    },
    {
      id: 'minutes',
      header: 'MIN',
      accessorKey: 'minutes',
      sortingFn: 'alphanumeric',
    },
    {
      id: 'points',
      header: 'PTS',
      accessorKey: 'points',
      sortDescFirst: true,
      sortUndefined: 'last',
    },
    {
      id: 'fieldGoals',
      header: 'FG',
      accessorFn: (row) => row.fieldGoals.made,
      cell: ({ row }) =>
        `${row.original.fieldGoals.made}-${row.original.fieldGoals.attempted}`,
      sortDescFirst: true,
    },
    {
      id: 'threePointers',
      header: '3P',
      accessorFn: (row) => row.threePointers.made,
      cell: ({ row }) =>
        `${row.original.threePointers.made}-${row.original.threePointers.attempted}`,
      sortDescFirst: true,
    },
    {
      id: 'freeThrows',
      header: 'FT',
      accessorFn: (row) => row.freeThrows.made,
      cell: ({ row }) =>
        `${row.original.freeThrows.made}-${row.original.freeThrows.attempted}`,
      sortDescFirst: true,
    },
    {
      id: 'rebounds',
      header: 'REB',
      accessorKey: 'rebounds',
      sortDescFirst: true,
      sortUndefined: 'last',
    },
    {
      id: 'assists',
      header: 'AST',
      accessorKey: 'assists',
      sortDescFirst: true,
      sortUndefined: 'last',
    },
    {
      id: 'steals',
      header: 'STL',
      accessorKey: 'steals',
      sortDescFirst: true,
      sortUndefined: 'last',
    },
    {
      id: 'blocks',
      header: 'BLK',
      accessorKey: 'blocks',
      sortDescFirst: true,
      sortUndefined: 'last',
    },
  ];

  // Set initial sorting state: default sort by points descending
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'points', desc: true },
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
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border-b border-gray-300 px-4 py-2 text-left font-semibold cursor-pointer hover:bg-gray-200"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {header.column.getIsSorted() &&
                    (header.column.getIsSorted() === 'desc' ? ' ▼' : ' ▲')}
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
              (index === 0 || table.getRowModel().rows[index - 1]?.original.team === 'home');

            return (
              <React.Fragment key={row.id}>
                {isFirstAwayPlayer && (
                  <tr data-testid="team-divider">
                    <td
                      colSpan={columns.length}
                      className="border-t-2 border-gray-400 bg-gray-100 px-4 py-2 text-center font-semibold"
                    >
                      {awayTeam.name}
                    </td>
                  </tr>
                )}
                <tr
                  className={`hover:bg-gray-50 ${
                    row.original.team === 'home' && index === 0 ? '' : ''
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="border-b border-gray-200 px-4 py-2 whitespace-nowrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      {/* Display home team name above home players */}
      <div className="mt-2 text-xs text-gray-600 text-center">
        Home: {homeTeam.name}
      </div>
    </div>
  );
}
