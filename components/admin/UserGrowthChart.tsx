'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, TrendingUp, Filter } from 'lucide-react';

interface UserGrowthData {
  date: string;
  count: number;
  label: string;
}

interface UserGrowthResponse {
  data: UserGrowthData[];
  granularity: string;
  userType: string;
  totalDataPoints: number;
  startDate: string;
  endDate: string;
}

export default function UserGrowthChart() {
  const [data, setData] = useState<UserGrowthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState('daily');
  const [userType, setUserType] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [limit, setLimit] = useState(30);
  const [useCustomRange, setUseCustomRange] = useState(false);

  useEffect(() => {
    fetchData();
  }, [granularity, userType, limit, useCustomRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        granularity,
        userType,
        limit: limit.toString(),
      });

      if (useCustomRange && customStartDate && customEndDate) {
        params.append('startDate', customStartDate);
        params.append('endDate', customEndDate);
      }

      const response = await fetch(`/api/admin/user-growth?${params}`);
      const result: UserGrowthResponse = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Failed to fetch user growth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      setUseCustomRange(true);
    }
  };

  const getDefaultLimit = () => {
    switch (granularity) {
      case 'daily': return 30;
      case 'weekly': return 12;
      case 'monthly': return 12;
      default: return 30;
    }
  };

  const getLimitOptions = () => {
    switch (granularity) {
      case 'daily': return [7, 14, 30, 60, 90];
      case 'weekly': return [4, 8, 12, 24, 52];
      case 'monthly': return [3, 6, 12, 24, 36];
      default: return [30];
    }
  };

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const totalUsers = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            User Growth
          </h3>
          <p className="text-sm text-gray-600">
            Total new users: {totalUsers.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">Filters</span>
        </div>
      </div>

             {/* Filters */}
       <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
         {/* Granularity Filter */}
         <div className="flex items-center space-x-2">
           <Calendar className="w-4 h-4 text-gray-400" />
           <select
             value={granularity}
             onChange={(e) => {
               setGranularity(e.target.value);
               setLimit(getDefaultLimit());
               setUseCustomRange(false);
             }}
             className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
           >
             <option value="daily">Daily</option>
             <option value="weekly">Weekly</option>
             <option value="monthly">Monthly</option>
           </select>
         </div>

         {/* Data Points Limit */}
         <div className="flex items-center space-x-2">
           <span className="text-sm text-gray-600">Show:</span>
           <select
             value={limit}
             onChange={(e) => setLimit(parseInt(e.target.value))}
             className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
           >
             {getLimitOptions().map(option => (
               <option key={option} value={option}>
                 {option} {granularity === 'daily' ? 'days' : granularity === 'weekly' ? 'weeks' : 'months'}
               </option>
             ))}
           </select>
         </div>

         {/* User Type Filter */}
         <div className="flex items-center space-x-2">
           <Users className="w-4 h-4 text-gray-400" />
           <select
             value={userType}
             onChange={(e) => setUserType(e.target.value)}
             className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
           >
             <option value="all">All Users</option>
             <option value="seeker">Seekers Only</option>
             <option value="provider">Providers Only</option>
           </select>
         </div>

         {/* Custom Date Range Toggle */}
         <div className="flex items-center space-x-2">
           <input
             type="checkbox"
             id="customRange"
             checked={useCustomRange}
             onChange={(e) => setUseCustomRange(e.target.checked)}
             className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
           />
           <label htmlFor="customRange" className="text-sm text-gray-600">
             Custom range
           </label>
         </div>

         {/* Custom Date Range */}
         {useCustomRange && (
           <div className="flex items-center space-x-2">
             <input
               type="date"
               value={customStartDate}
               onChange={(e) => setCustomStartDate(e.target.value)}
               className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
             />
             <span className="text-gray-500">to</span>
             <input
               type="date"
               value={customEndDate}
               onChange={(e) => setCustomEndDate(e.target.value)}
               className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
             />
             <button
               onClick={handleCustomDateSubmit}
               className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
             >
               Apply
             </button>
           </div>
         )}
       </div>

             {/* Chart */}
       {loading ? (
         <div className="h-80 flex items-center justify-center">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
         </div>
       ) : data.length === 0 ? (
         <div className="h-80 flex items-center justify-center text-gray-500">
           <div className="text-center">
             <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
             <p>No data available for the selected period</p>
           </div>
         </div>
       ) : (
         <div className="h-80">
           {/* Y-axis labels */}
           <div className="flex h-full">
             <div className="w-12 flex flex-col justify-between text-xs text-gray-500 pr-2">
               {[maxCount, Math.ceil(maxCount * 0.75), Math.ceil(maxCount * 0.5), Math.ceil(maxCount * 0.25), 0].map((value, index) => (
                 <div key={index} className="text-right">
                   {value}
                 </div>
               ))}
             </div>
             
             {/* Chart area */}
             <div className="flex-1 relative">
               {/* Grid lines */}
               <div className="absolute inset-0 flex flex-col justify-between">
                 {[0, 1, 2, 3, 4].map((_, index) => (
                   <div key={index} className="border-t border-gray-100"></div>
                 ))}
               </div>
               
               {/* Bars */}
               <div className="flex items-end justify-between h-full px-2 space-x-1">
                 {data.map((item, index) => {
                   const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                   const isPeak = item.count === maxCount && maxCount > 0;
                   
                   return (
                     <div key={index} className="flex flex-col items-center flex-1 group">
                       {/* Bar container */}
                       <div className="w-full relative flex flex-col justify-end h-full">
                         {/* Bar */}
                         <div
                           className={`w-full rounded-t-md transition-all duration-500 ease-out relative ${
                             isPeak 
                               ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-lg' 
                               : 'bg-gradient-to-t from-indigo-500 to-indigo-400'
                           }`}
                           style={{
                             height: `${height}%`,
                             minHeight: item.count > 0 ? '8px' : '0px',
                           }}
                         >
                           {/* Hover effect overlay */}
                           <div className="absolute inset-0 bg-white bg-opacity-20 rounded-t-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           
                           {/* Peak indicator */}
                           {isPeak && (
                             <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                               <div className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                                 Peak
                               </div>
                             </div>
                           )}
                         </div>
                         
                         {/* Tooltip */}
                         <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20 shadow-xl">
                           <div className="font-semibold">{item.count} {item.count === 1 ? 'user' : 'users'}</div>
                           <div className="text-xs text-gray-300">
                             {item.label}
                           </div>
                           {/* Tooltip arrow */}
                           <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                         </div>
                       </div>
                       
                       {/* Date label */}
                       <div className="mt-3 text-xs text-gray-600 text-center font-medium">
                         {granularity === 'daily' ? 
                           new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }) :
                           granularity === 'weekly' ?
                           `W${Math.ceil((new Date(item.date).getDate()) / 7)}` :
                           new Date(item.date).toLocaleDateString('en-US', { month: 'short' })
                         }
                       </div>
                       
                       {/* Count label */}
                       <div className={`text-xs font-bold mt-1 ${
                         isPeak ? 'text-emerald-600' : 'text-gray-700'
                       }`}>
                         {item.count}
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>
           </div>
           
           {/* X-axis label */}
           <div className="mt-4 text-center">
             <span className="text-sm text-gray-500 font-medium">
               {granularity === 'daily' ? 'Days' : 
                granularity === 'weekly' ? 'Weeks' : 
                'Months'}
             </span>
           </div>
         </div>
       )}

             {/* Summary Stats */}
       {data.length > 0 && (
         <div className="mt-8 grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
           <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
             <div className="text-3xl font-bold text-indigo-600 mb-1">{totalUsers}</div>
             <div className="text-sm font-medium text-gray-600">Total New Users</div>
             <div className="text-xs text-gray-500 mt-1">in {data.length} {granularity === 'daily' ? 'days' : granularity === 'weekly' ? 'weeks' : 'months'}</div>
           </div>
           <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
             <div className="text-3xl font-bold text-emerald-600 mb-1">
               {(totalUsers / data.length).toFixed(1)}
             </div>
             <div className="text-sm font-medium text-gray-600">Average per {granularity === 'daily' ? 'Day' : granularity === 'weekly' ? 'Week' : 'Month'}</div>
             <div className="text-xs text-gray-500 mt-1">{granularity} growth rate</div>
           </div>
           <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
             <div className="text-3xl font-bold text-purple-600 mb-1">
               {Math.max(...data.map(d => d.count))}
             </div>
             <div className="text-sm font-medium text-gray-600">Peak Day</div>
             <div className="text-xs text-gray-500 mt-1">highest single day</div>
           </div>
         </div>
       )}
    </div>
  );
}
