"use client";

import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import type { FootballPlayerStats, Team } from "@/types/sports-data";

interface FootballPlayerStatsTableProps {
  homeStats: FootballPlayerStats[];
  awayStats: FootballPlayerStats[];
  homeTeam: Team;
  awayTeam: Team;
}

type PlayerWithTeam = FootballPlayerStats & { team: "home" | "away" };

/**
 * Football player statistics table component.
 * Displays player stats in sortable table format using @tanstack/react-table.
 *
 * Columns:
 * - Player (jersey + name)
 * - POS (position)
 * - MIN (minutes played)
 * - G (goals)
 * - A (assists)
 * - SH (shots)
 * - PA (passes)
 * - TK (tackles)
 * - YC (yellow cards)
 * - RC (red cards)
 */
export function FootballPlayerStatsTable({
  homeStats,
  awayStats,
  homeTeam,
  awayTeam,
}: FootballPlayerStatsTableProps) {
  // Combine data with team identifier
  const data: PlayerWithTeam[] = [
    ...homeStats.map((p) => ({ ...p, team: "home" as const })),
    ...awayStats.map((p) => ({ ...p, team: "away" as const })),
  ];

  // Define column definitions
  const columns: ColumnDef<PlayerWithTeam>[] = [
    {
      id: "player",
      header: "Player",
      accessorFn: (row) => row.lastName,
      cell: ({ row }) =>
        `#${row.original.jerseyNumber} ${row.original.lastName}`,
      enableSorting: false,
    },
    {
      id: "position",
      header: "POS",
      accessorKey: "position",
      enableSorting: false,
    },
    {
      id: "minutesPlayed",
      header: "MIN",
      accessorKey: "minutesPlayed",
      sortDescFirst: true,
    },
    {
      id: "goals",
      header: "G",
      accessorKey: "goals",
      sortDescFirst: true,
      sortUndefined: "last",
    },
    {
      id: "assists",
      header: "A",
      accessorKey: "assists",
      sortDescFirst: true,
      sortUndefined: "last",
    },
    {
      id: "shots",
      header: "SH",
      accessorKey: "shots",
      sortDescFirst: true,
      sortUndefined: "last",
    },
    {
      id: "passes",
      header: "PA",
      accessorKey: "passes",
      sortDescFirst: true,
      sortUndefined: "last",
    },
    {
      id: "tackles",
      header: "TK",
      accessorKey: "tackles",
      sortDescFirst: true,
      sortUndefined: "last",
    },
    {
      id: "yellowCards",
      header: "YC",
      accessorKey: "yellowCards",
      sortDescFirst: true,
      sortUndefined: "last",
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return value > 0 ? (
          <span className="text-yellow-600 font-semibold">{value}</span>
        ) : (
          value
        );
      },
    },
    {
      id: "redCards",
      header: "RC",
      accessorKey: "redCards",
      sortDescFirst: true,
      sortUndefined: "last",
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return value > 0 ? (
          <span className="text-red-600 font-semibold">{value}</span>
        ) : (
          value
        );
      },
    },
  ];

  // Set initial sorting state: default sort by goals descending
  const [sorting, setSorting] = useState<SortingState>([
    { id: "goals", desc: true },
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
        <thead className="bg-gray-200 dark:bg-gray-700">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortDirection = header.column.getIsSorted();
                const canSort = header.column.getCanSort();
                return (
                  <th
                    key={header.id}
                    className="border-b border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                    aria-sort={
                      canSort
                        ? sortDirection === "asc"
                          ? "ascending"
                          : sortDirection === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {sortDirection &&
                      (sortDirection === "desc" ? " ▼" : " ▲")}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {(() => {
            const rows = table.getRowModel().rows;
            const homeRows = rows.filter((r) => r.original.team === "home");
            const awayRows = rows.filter((r) => r.original.team === "away");

            return (
              <>
                {/* Home team section */}
                <tr data-testid="home-team-header">
                  <td
                    colSpan={columns.length}
                    className="bg-gray-100 dark:bg-gray-700 px-4 py-2 text-center font-semibold text-gray-900 dark:text-gray-100"
                  >
                    {homeTeam.name}
                  </td>
                </tr>
                {homeRows.map((row) => (
                  <tr
                    key={row.id}
                    className="bg-white dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900/40"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="border-b border-gray-200 px-4 py-2 whitespace-nowrap text-gray-900 dark:text-gray-100"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Away team section */}
                <tr data-testid="team-divider">
                  <td
                    colSpan={columns.length}
                    className="border-t-2 border-gray-400 bg-gray-100 dark:bg-gray-700 px-4 py-2 text-center font-semibold text-gray-900 dark:text-gray-100"
                  >
                    {awayTeam.name}
                  </td>
                </tr>
                {awayRows.map((row) => (
                  <tr
                    key={row.id}
                    className="bg-white dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900/40"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="border-b border-gray-200 px-4 py-2 whitespace-nowrap text-gray-900 dark:text-gray-100"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            );
          })()}
        </tbody>
      </table>
    </div>
  );
}
