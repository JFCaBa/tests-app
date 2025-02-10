// components/tuition/BookingPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { PayPalButtons } from "@paypal/react-paypal-js";
import PhoneInput from "react-phone-number-input";
import axios from "axios";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const BookingPage = () => {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tutor, setTutor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    const fetchTutorDetails = async () => {
      try {
        const response = await axios.get(`/api/tutors/${tutorId}`);
        setTutor(response.data);

        // Fetch available slots for the current week
        const slotsResponse = await axios.get(
          `/api/tutors/${tutorId}/availability`
        );
        setAvailableSlots(slotsResponse.data);
      } catch (error) {
        console.error("Error fetching tutor details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load tutor details",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTutorDetails();
  }, [tutorId]);

  const handleSlotSelect = ({ start, end }) => {
    // Check if slot is available
    const isAvailable = availableSlots.some(
      (slot) =>
        slot.startTime === format(start, "HH:mm") &&
        slot.endTime === format(end, "HH:mm") &&
        slot.dayOfWeek === getDay(start)
    );

    if (!isAvailable) {
      toast({
        variant: "destructive",
        title: "Unavailable Slot",
        description: "This time slot is not available for booking",
      });
      return;
    }

    setSelectedSlot({ start, end });
  };

  const handlePaypalPayment = async (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: tutor.hourlyRate,
          },
        },
      ],
    });
  };

  const handlePhonePayment = async () => {
    if (!phoneNumber) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
      });
      return;
    }

    try {
      const response = await axios.post("/api/tutors/sessions", {
        tutorId,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        paymentMethod: "phone",
        phoneNumber,
      });

      toast({
        title: "Booking Successful",
        description: "You will receive payment instructions via SMS",
      });

      navigate("/tuition/sessions");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description:
          error.response?.data?.message || "Failed to create booking",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Book a Session with {tutor.user.username}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Select Date & Time</h3>
              <Calendar
                localizer={localizer}
                events={availableSlots.map((slot) => ({
                  start: new Date(slot.startTime),
                  end: new Date(slot.endTime),
                  title: "Available",
                }))}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={handleSlotSelect}
                style={{ height: 500 }}
              />
            </div>

            <div>
              {selectedSlot && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Selected Time</h3>
                    <p>
                      {format(selectedSlot.start, "MMMM d, yyyy h:mm a")} -{" "}
                      {format(selectedSlot.end, "h:mm a")}
                    </p>
                    <p className="font-medium mt-2">
                      Total: ${tutor.hourlyRate}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Payment Method</h3>
                    <Select onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {tutor.phonePayments && (
                          <SelectItem value="phone">Phone Payment</SelectItem>
                        )}
                        {tutor.paypalPayments && (
                          <SelectItem value="paypal">PayPal</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentMethod === "phone" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <PhoneInput
                        international
                        value={phoneNumber}
                        onChange={setPhoneNumber}
                        className="mb-4"
                      />
                      <Button onClick={handlePhonePayment} className="w-full">
                        Continue with Phone Payment
                      </Button>
                    </div>
                  )}

                  {paymentMethod === "paypal" && (
                    <PayPalButtons
                      createOrder={handlePaypalPayment}
                      onApprove={async (data, actions) => {
                        await actions.order.capture();
                        // Handle successful payment
                        const response = await axios.post(
                          "/api/tutors/sessions",
                          {
                            tutorId,
                            startTime: selectedSlot.start,
                            endTime: selectedSlot.end,
                            paymentMethod: "paypal",
                            paypalOrderId: data.orderID,
                          }
                        );

                        toast({
                          title: "Booking Successful",
                          description: "Your session has been booked",
                        });

                        navigate("/tuition/sessions");
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingPage;
