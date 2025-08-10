import React from "react";
import { DateRange } from "react-date-range";

export default function DateRangePicker({ range, onChange }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 shadow-lg">
      <DateRange
        ranges={[{ startDate: range.startDate, endDate: range.endDate, key: 'selection' }]}
        onChange={(item) => onChange({ startDate: item.selection.startDate, endDate: item.selection.endDate })}
        moveRangeOnFirstSelection={false}
        months={2}
        direction="horizontal"
        rangeColors={["#0ea5e9"]}
        showMonthAndYearPickers={true}
      />
    </div>
  );
}
