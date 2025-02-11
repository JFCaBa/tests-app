import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { format } from "date-fns";
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
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import PhoneInput from "react-phone-number-input";
import axios from "axios";

const localizer = momentLocalizer(moment);

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
  const [events, setEvents] = useState([]);
  const { t } = useTranslation();
  const [{ isPending }] = usePayPalScriptReducer();

  useEffect(() => {
    const fetchTutorDetails = async () => {
      try {
        const response = await axios.get(`/tutors/${tutorId}`);
        setTutor(response.data);

        const slots = response.data.availability;
        setAvailableSlots(slots);

        const calendarEvents = slots.map((slot) => ({
          start: moment(slot.date + "T" + slot.startTime).toDate(),
          end: moment(slot.date + "T" + slot.endTime).toDate(),
          title: "Available",
          resource: slot,
        }));

        setEvents(calendarEvents);
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
  }, [tutorId, toast]);

  const handleSelectSlot = ({ start }) => {
    // Create a one hour slot from the clicked time
    const endTime = moment(start).add(1, "hour").toDate();

    // Find if this slot is available
    const selectedEvent = events.find((event) =>
      moment(event.start).isSame(moment(start), "hour")
    );

    if (selectedEvent) {
      toast({
        variant: "destructive",
        title: "Unavailable Slot",
        description: "Please select an available time slot",
      });
      return;
    }

    setSelectedDate(start);
    setSelectedSlot({
      start,
      end: endTime,
    });
  };

  const handleSelectEvent = (event) => {
    // Handle event selection logic here
    setSelectedSlot({
      start: event.start,
      end: event.end,
    });
  };

  const handlePaypalPayment = async (data, actions) => {
    try {
      // Create the order on PayPal
      const order = await actions.order.create({
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: "10",
            },
          },
        ],
      });

      return order;
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "There was an error processing your payment.",
      });
    }
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
      const response = await axios.post("/tutors/sessions", {
        tutorId,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        paymentMethod: "phone",
        amount: "10.0",
        status: "paid",
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

  const handlePaymentApproval = async (data, actions) => {
    try {
      // Capture the payment after approval
      const paymentDetails = await actions.order.capture();

      // Send the payment details to the backend to confirm and complete the booking
      const response = await axios.post("/tutors/sessions", {
        tutorId,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        subject: "exam",
        paymentMethod: "paypal",
        amount: "10.0",
        status: "paid",
        // paypalOrderId: data.orderID,
        // paymentDetails,
      });

      toast({
        title: "Booking Successful",
        description: "Your session has been booked successfully.",
      });

      navigate("/tuition/sessions");
    } catch (error) {
      console.error("Error capturing PayPal payment:", error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "There was an error confirming your payment.",
      });
    }
  };

  const calendarStyle = {
    height: 500,
  };

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor:
        selectedSlot?.start === event.start ? "#2563eb" : "#93c5fd",
      color: selectedSlot?.start === event.start ? "white" : "black",
      maxWidth: "100%",
      overflow: "hidden",
    },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {t("tuition.bookASessionWith")} {tutor?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="calendar-container">
              <h3 className="text-lg font-medium mb-4">
                {t("tuition.selectDateAndTime")}
              </h3>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable
                selected={selectedDate}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                {...calendarStyle}
                views={["week", "day"]}
                defaultView="week"
                min={moment().startOf("day").add(9, "hours").toDate()}
                max={moment().startOf("day").add(18, "hours").toDate()}
                step={60}
                timeslots={1}
                defaultDate={new Date()}
                onView={() => {}}
              />
            </div>

            <div>
              {selectedSlot && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      {t("tuition.selectTime")}
                    </h3>
                    <p>
                      {format(selectedSlot.start, "MMMM d, yyyy h:mm a")} -{" "}
                      {format(selectedSlot.end, "h:mm a")}
                    </p>
                    <p className="font-medium mt-2">
                      Total: ${tutor.hourlyRate}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      {t("tuition.paymentMethod")}
                    </h3>
                    <Select onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("tuition.selectPaymentMethod")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">
                          {t("tuition.phonePayment")}
                        </SelectItem>

                        <SelectItem value="paypal">
                          {t("tuition.paypal")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentMethod === "phone" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t("tuition.phoneNumber")}
                      </label>
                      <PhoneInput
                        international
                        value={phoneNumber}
                        onChange={setPhoneNumber}
                        className="w-full sm:w-1/2"
                      />
                      <Button onClick={handlePhonePayment} className="w-full">
                        {t("tuition.continueWithPhonePayment")}
                      </Button>
                    </div>
                  )}

                  {paymentMethod === "paypal" &&
                    (isPending ? (
                      <div className="spinner" />
                    ) : (
                      <PayPalButtons
                        style={{ layout: "vertical" }}
                        // createOrder={handlePaymentApproval}
                        createOrder={handlePaypalPayment}
                        onApprove={handlePaymentApproval}
                      />
                    ))}
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
