    "use client"

    import { Head, Link, router } from "@inertiajs/react";
    import { useState, useEffect, useRef } from "react";
    import { Button } from "@/Components/ui/button";
    import { Input } from "@/Components/ui/input";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
    import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    } from "@/Components/ui/select";
    import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    } from "@/Components/ui/table";
    import {
    ChevronLeft,
    ChevronRight,
    Search,
    Users,
    BookOpen,
    Award,
    TrendingUp,
    } from "lucide-react";
    import { cn } from "@/lib/utils";
    import AdminPageLayout from "../layout";
    import { Toaster } from "sonner";

    interface Student {
    id: number;
    nama_lengkap: string;
    email: string;
    class: string;
    created_at: string;
    progress_stats: {
        total_courses: number;
        progressed_courses: number;
        completed_courses: number;
        completion_rate: number;
        total_quizzes: number;
        passed_quizzes: number;
        quiz_pass_rate: number;
    };
    }

    interface Props {
    students?: {
        data: Student[];
        links: any[];
        meta: any;
    };
    filters?: {
        search: string;
        selectedClass: string;
        sortBy: string;
        sortOrder: string;
        availableClasses: string[];
    };
    }

    export default function StudentProgressPage({ students, filters }: Props) {
    // Safe defaults
    const safeStudents = students || { data: [], links: [], meta: {} };
    const safeFilters = filters || {
        search: '',
        selectedClass: 'all',
        sortBy: 'nama_lengkap',
        sortOrder: 'asc',
        availableClasses: []
    };

    const [search, setSearch] = useState(safeFilters.search);
    const [selectedClass, setSelectedClass] = useState(safeFilters.selectedClass);
    const [sortBy, setSortBy] = useState(safeFilters.sortBy);
    const [sortOrder, setSortOrder] = useState(safeFilters.sortOrder);

    // Refs to track previous values
    const prevSearch = useRef(search);
    const prevSelectedClass = useRef(selectedClass);
    const prevSortBy = useRef(sortBy);
    const prevSortOrder = useRef(sortOrder);

    // Apply filters when they change, but only when values actually change
    useEffect(() => {
        // Check if any filter values have actually changed
        const hasChanged =
        search !== prevSearch.current ||
        selectedClass !== prevSelectedClass.current ||
        sortBy !== prevSortBy.current ||
        sortOrder !== prevSortOrder.current;

        if (hasChanged) {
        // Update refs
        prevSearch.current = search;
        prevSelectedClass.current = selectedClass;
        prevSortBy.current = sortBy;
        prevSortOrder.current = sortOrder;

        // Debounce the navigation
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);

            // Update search parameter
            if (search) {
            params.set('search', search);
            } else {
            params.delete('search');
            }

            // Update class parameter
            if (selectedClass !== 'all') {
            params.set('class', selectedClass);
            } else {
            params.delete('class');
            }

            // Update sort parameters
            if (sortBy) {
            params.set('sort_by', sortBy);
            }

            if (sortOrder) {
            params.set('sort_order', sortOrder);
            }

            const newQuery = params.toString();
            const currentQuery = window.location.search.substring(1);

            // Only navigate if query params have actually changed
            if (newQuery !== currentQuery) {
            router.get(`/admin/student-progress?${newQuery}`, {}, {
                preserveState: true,
                preserveScroll: true
            });
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeout);
        }
    }, [search, selectedClass, sortBy, sortOrder]);

    const handleSort = (column: string) => {
        if (sortBy === column) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
        setSortBy(column);
        setSortOrder('asc');
        }
    };

    const getStatusColor = (percentage: number) => {
        if (percentage === 100) return "text-green-600 dark:text-green-400";
        if (percentage >= 75) return "text-blue-600 dark:text-blue-400";
        if (percentage >= 50) return "text-yellow-600 dark:text-yellow-400";
        if (percentage > 0) return "text-orange-600 dark:text-orange-400";
        return "text-gray-500 dark:text-gray-400";
    };

    const getStatusText = (percentage: number) => {
        if (percentage === 100) return "Completed";
        if (percentage >= 75) return "Almost Completed";
        if (percentage >= 50) return "In Progress";
        if (percentage > 0) return "Started";
        return "Not Started";
    };

    // Safe access to students data
    const studentsData = safeStudents.data || [];
    const studentsMeta = safeStudents.meta || {};
    const availableClasses = safeFilters.availableClasses || [];

    return (
        <AdminPageLayout>
        <Head title="Student Progress" />
        <Toaster position="top-right" />

        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-red-700 to-red-500 bg-clip-text">
                Student Progress
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                Track and monitor student course completion and quiz performance
                </p>
            </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <CardDescription>Active learners</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{studentsMeta.total || 0}</div>
                    <Users className="w-4 h-4 text-red-600" />
                </div>
                </CardContent>
            </Card>
            <Card className="border-0 shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
                <CardDescription>Course completion rate</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                    {studentsData.length > 0
                        ? Math.round(studentsData.reduce((sum, student) => sum + (student.progress_stats?.completion_rate || 0), 0) / studentsData.length) + "%"
                        : "0%"}
                    </div>
                    <TrendingUp className="w-4 h-4 text-red-600" />
                </div>
                </CardContent>
            </Card>
            <Card className="border-0 shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Quiz Pass</CardTitle>
                <CardDescription>Quiz pass rate</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                    {studentsData.length > 0
                        ? Math.round(studentsData.reduce((sum, student) => sum + (student.progress_stats?.quiz_pass_rate || 0), 0) / studentsData.length) + "%"
                        : "0%"}
                    </div>
                    <Award className="w-4 h-4 text-red-600" />
                </div>
                </CardContent>
            </Card>
            <Card className="border-0 shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Courses Tracked</CardTitle>
                <CardDescription>Per student max</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                    {studentsData.length > 0
                        ? Math.max(...studentsData.map(s => s.progress_stats?.total_courses || 0))
                        : "0"}
                    </div>
                    <BookOpen className="w-4 h-4 text-red-600" />
                </div>
                </CardContent>
            </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader>
                <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                    placeholder="Search students..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                    />
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {availableClasses.map((classItem) => (
                        <SelectItem key={classItem} value={classItem}>
                        {classItem}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
            </CardContent>
            </Card>

            {/* Students Table */}
            <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader>
                <CardTitle>Student Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('nama_lengkap')}>
                        Student Name
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('class')}>
                        Class
                    </TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Quizzes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {studentsData.length > 0 ? (
                    studentsData.map((student) => (
                        <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.nama_lengkap}</TableCell>
                        <TableCell>{student.class || ''}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                            <span>{student.progress_stats?.completed_courses || 0}</span>
                            <span className="text-slate-500 dark:text-slate-400">/</span>
                            <span>{student.progress_stats?.total_courses || 0}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                            <div className="w-24 bg-secondary rounded-full h-2">
                                <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${student.progress_stats?.completion_rate || 0}%` }}
                                ></div>
                            </div>
                            <span className={cn("text-xs font-medium", getStatusColor(student.progress_stats?.completion_rate || 0))}>
                                {student.progress_stats?.completion_rate || 0}%
                            </span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {getStatusText(student.progress_stats?.completion_rate || 0)}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                            <span>{student.progress_stats?.passed_quizzes || 0}</span>
                            <span className="text-slate-500 dark:text-slate-400">/</span>
                            <span>{student.progress_stats?.total_quizzes || 0}</span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                            {(student.progress_stats?.quiz_pass_rate || 0) > 0
                                ? `${Math.round(student.progress_stats?.quiz_pass_rate || 0)}% pass rate`
                                : "No quizzes taken"}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/student-progress/${student.id}`}>
                                View Details
                            </Link>
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No students found
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>

                {/* Pagination */}
                {studentsMeta.links && studentsMeta.links.length > 3 && (
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                    Showing {studentsMeta.from || 0} to {studentsMeta.to || 0} of{" "}
                    {studentsMeta.total || 0} entries
                    </div>
                    <div className="flex items-center space-x-2">
                    {studentsMeta.links.map((link: any, index: number) => (
                        <Button
                        key={index}
                        variant={link.active ? "default" : "outline"}
                        size="sm"
                        onClick={() => link.url && router.get(link.url)}
                        disabled={!link.url}
                        className={cn(
                            "h-8 w-8 p-0 rounded-lg",
                            !link.url && "opacity-50 cursor-not-allowed"
                        )}
                        >
                        {index === 0 ? (
                            <ChevronLeft className="h-4 w-4" />
                        ) : index === studentsMeta.links.length - 1 ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            link.label
                        )}
                        </Button>
                    ))}
                    </div>
                </div>
                )}
            </CardContent>
            </Card>
        </div>
        </AdminPageLayout>
    );
    }
