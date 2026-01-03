"use client"

import { useEffect, useState } from "react"
import Calendar from "react-calendar"
import 'react-calendar/dist/Calendar.css'
import type { AttendanceRecord } from "@/lib/types"
import { cn } from "@/lib/utils"
import "@/styles/globals.css"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock } from "lucide-react"
import { toast } from "sonner"

export default function EmployeeAttendanceCalendar() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [value, setValue] = useState(new Date())
  const [actionLoading, setActionLoading] = useState(false)
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)

  useEffect(() => {
    fetchAttendance()
  }, [])

  useEffect(() => {
    const todayStr = new Date().toLocaleDateString("en-CA")
    const record = attendance.find(a => new Date(a.date).toLocaleDateString("en-CA") === todayStr) || null
    setTodayRecord(record)
  }, [attendance])

  useEffect(() => {
    const dateStr = value.toLocaleDateString("en-CA")
    const record = attendance.find(a => new Date(a.date).toLocaleDateString("en-CA") === dateStr) || null
    setSelectedRecord(record)
  }, [value, attendance])

  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/attendance")
      const data = await res.json()
      setAttendance(data.attendance)
    } catch (err) {
      console.error("Fetch attendance error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    setActionLoading(true)
    try {
      const res = await fetch("/api/attendance/checkin", { method: "POST" })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error || "Failed to check in")
      toast.success("Checked in successfully!")
      fetchAttendance()
    } catch (err) {
      console.error(err)
      toast.error("Check-in failed")
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setActionLoading(true)
    try {
      const res = await fetch("/api/attendance/checkout", { method: "POST" })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error || "Failed to check out")
      toast.success("Checked out successfully!")
      fetchAttendance()
    } catch (err) {
      console.error(err)
      toast.error("Check-out failed")
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-chart-3/40 text-chart-3"
      case "late": return "bg-chart-4/40 text-chart-4"
      case "absent": return "bg-destructive/40 text-destructive"
      case "half-day": return "bg-chart-2/40 text-chart-2"
      default: return "bg-muted/20 text-muted-foreground"
    }
  }

  const attendanceMap: Record<string, AttendanceRecord> = {}
  attendance.forEach(rec => {
    const dateStr = new Date(rec.date).toLocaleDateString("en-CA")
    attendanceMap[dateStr] = rec
  })

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = date.toLocaleDateString("en-CA")
      const record = attendanceMap[dateStr]
      if (record) {
        return (
          <div className={cn(
            "text-xs mt-1 rounded-full px-2 py-1 font-medium text-center transition-all",
            getStatusColor(record.status)
          )}>
            {record.status}
          </div>
        )
      }
    }
    return null
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-[#f3f2f7] to-[#fff] flex flex-col items-center font-roboto">
      <h1 className="text-4xl font-bold tracking-tight mb-2">My Attendance Calendar</h1>
      <p className="text-muted-foreground mb-6">Visual overview of your attendance</p>

      {/* TODAY PANEL */}
      <div className="w-full max-w-6xl mb-6 p-6 bg-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        {todayRecord ? (
          <div className="flex items-center gap-4">
            <CheckCircle2 className="text-chart-3 w-6 h-6" />
            <div>
              <p className="font-medium">You have checked in today</p>
              <p className="text-sm text-muted-foreground">
                Check-in: {todayRecord.checkIn} | Check-out: {todayRecord.checkOut || "-"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Clock className="w-6 h-6 text-muted-foreground" />
            <p className="text-muted-foreground">You haven't checked in today</p>
          </div>
        )}

        {todayRecord?.checkIn && !todayRecord.checkOut ? (
          <Button onClick={handleCheckOut} disabled={actionLoading}>
            {actionLoading ? "Processing..." : "Check Out"}
          </Button>
        ) : !todayRecord ? (
          <Button onClick={handleCheckIn} disabled={actionLoading}>
            {actionLoading ? "Processing..." : "Check In"}
          </Button>
        ) : null}
      </div>

      {/* CALENDAR */}
      {loading ? (
        <p className="text-center py-20 text-muted-foreground text-lg">Loading...</p>
      ) : (
        <>
          <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl p-8 mb-6">
            <Calendar
              onChange={(val) => { if (val instanceof Date) setValue(val) }}
              value={value}
              tileContent={tileContent}
              className="react-calendar-custom border-none text-base"
              prevLabel="‹"
              nextLabel="›"
              prev2Label={null}
              next2Label={null}
              showNeighboringMonth={false}
            />
          </div>

          {/* SELECTED DATE DETAILS */}
          <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl p-6 flex flex-col gap-2">
            <h2 className="text-xl font-semibold">Attendance Details</h2>
            {selectedRecord ? (
              <p className="text-muted-foreground">
                Date: {new Date(selectedRecord.date).toLocaleDateString("en-CA")} <br />
                Check-in: {selectedRecord.checkIn} <br />
                Check-out: {selectedRecord.checkOut || "-"} <br />
                Work Hours: {selectedRecord.workHours || "-"} <br />
                Status: <span className={cn("font-medium", getStatusColor(selectedRecord.status))}>{selectedRecord.status}</span>
              </p>
            ) : (
              <p className="text-muted-foreground">No attendance recorded for this date.</p>
            )}
          </div>
        </>
      )}

      <style jsx global>{`
        /* Smooth large grayish calendar */
        .react-calendar-custom {
          width: 100%;
          font-family: 'Roboto', sans-serif;
          border-radius: 24px;
          padding: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.05);
        }
        .react-calendar-custom__tile {
          border-radius: 16px;
          padding: 1.2rem 0;
          transition: all 0.2s;
        }
        .react-calendar-custom__tile:hover {
          background-color: rgba(128,128,128,0.1); /* gray hover */
        }
        .react-calendar-custom__navigation button {
          border-radius: 12px;
          padding: 0.5rem 1rem;
          font-weight: 500;
          transition: all 0.2s;
          background: none;
        }
        .react-calendar-custom__navigation button:hover {
          background-color: rgba(128,128,128,0.15);
        }
        .react-calendar-custom__month-view__weekdays {
          text-transform: uppercase;
          font-weight: 500;
          color: #555;
          margin-bottom: 8px;
        }
        .react-calendar-custom__month-view__days__day {
          font-weight: 500;
          height: 4rem; /* make each day tile taller for length */
        }
      `}</style>
    </div>
  )
}
