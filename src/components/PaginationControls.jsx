import { useState, useEffect } from 'react';

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    const [inputPage, setInputPage] = useState(currentPage);

    useEffect(() => {
        setInputPage(currentPage);
    }, [currentPage]);

    const handleSubmit = () => {
        let p = parseInt(inputPage);
        if (isNaN(p)) {
            setInputPage(currentPage);
            return;
        }
        const target = Math.max(1, Math.min(p, totalPages));
        onPageChange(target);
        setInputPage(target);
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center gap-2 mt-6 pb-6">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-surface border border-border text-secondary disabled:opacity-50 rounded-sm hover:bg-accent hover:text-primary transition-colors text-sm"
            >
                Previous
            </button>
            <div className="flex items-center gap-2">
                <span className="text-secondary text-sm">Page</span>
                <input
                    type="number"
                    className="w-12 bg-white dark:bg-black/20 border border-border p-1 text-center text-slate-900 dark:text-white rounded-sm text-sm"
                    value={inputPage}
                    onChange={(e) => setInputPage(e.target.value)}
                    onBlur={handleSubmit}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <span className="text-secondary text-sm">of {totalPages}</span>
            </div>
            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-surface border border-border text-secondary disabled:opacity-50 rounded-sm hover:bg-accent hover:text-primary transition-colors text-sm"
            >
                Next
            </button>
        </div>
    );
};

export default PaginationControls;
