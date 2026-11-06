import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, X, Users, RefreshCw } from 'lucide-react';
import api from '../api/client';
import EventCard from '../components/EventCard';

export default function EventsDiscovery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category_id') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState('date_asc');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [searchParams, onlyAvailable, sortBy]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(res.data);
    } catch (e) {
      console.error("Failed to load categories:", e);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (statusFilter) params.append('status_filter', statusFilter);
      if (onlyAvailable) params.append('only_available', 'true');

      const res = await api.get(`/events/?${params.toString()}`);
      let eventList = res.data.events || [];

      // Sort
      if (sortBy === 'date_asc') {
        eventList.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (sortBy === 'date_desc') {
        eventList.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (sortBy === 'capacity') {
        eventList.sort((a, b) => b.capacity - a.capacity);
      }

      setEvents(eventList);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams();
  };

  const updateUrlParams = () => {
    const params = {};
    if (search) params.search = search;
    if (selectedCategory) params.category_id = selectedCategory;
    if (statusFilter) params.status = statusFilter;
    setSearchParams(params);
  };

  const handleCategorySelect = (catId) => {
    const newCat = selectedCategory === String(catId) ? '' : String(catId);
    setSelectedCategory(newCat);
    const params = Object.fromEntries(searchParams.entries());
    if (newCat) params.category_id = newCat;
    else delete params.category_id;
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setStatusFilter('');
    setOnlyAvailable(false);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Browse Campus Events</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore upcoming hackathons, guest seminars, masterclasses, and student festivals.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
        
        {/* Search Input & Sort */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event title, description, or venue..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); updateUrlParams(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                const params = Object.fromEntries(searchParams.entries());
                if (e.target.value) params.status = e.target.value;
                else delete params.status;
                setSearchParams(params);
              }}
              className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Statuses</option>
              <option value="approved">Upcoming Approved</option>
              <option value="completed">Completed Events</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="date_asc">Date: Soonest First</option>
              <option value="date_desc">Date: Latest First</option>
              <option value="capacity">Capacity: Largest First</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
            >
              Search
            </button>
          </div>
        </form>

        {/* Category Pills & Availability Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleCategorySelect('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                !selectedCategory
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === String(cat.id)
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
              <span>Available Seats Only</span>
            </label>

            {(search || selectedCategory || statusFilter || onlyAvailable) && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
              <div className="h-40 bg-slate-100 rounded-xl mb-4"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No events matched your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try adjusting your search terms, removing category filters, or checking back soon for newly approved events.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-medium text-slate-500">
            Showing <b>{events.length}</b> events
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
