import { Button, Text, View } from "@nodegui/react-nodegui";
import React from "react";
import axios from 'axios';
import { createPDF } from './quotePDFGenerator';
import { generateEmailReferral } from "./emailRefferal";
import {  QFileDialog, FileMode, WidgetEventTypes } from "@nodegui/nodegui";

export class QuoteViewer extends React.Component<any, any> {

    constructor(props: any) {
        super(props);

        this.state = {
            quotes: null
        }

        axios.post('http://localhost:3000/quotes/getAllQuotes')
        .then((resQuotes) => {
            axios.post('http://localhost:3000/bookings/getAllBookings')
            .then((resBookings) => {
                axios.post('http://localhost:3000/patients/getAllPatientData')
                .then((resPatients) => {
                    axios.post('http://localhost:3000/accounts/getAllAccounts')
                    .then((resAccounts) => {
                        this.setState({
                            quotes: resQuotes.data.result,
                            bookings: resBookings.data.result,
                            patients: resPatients.data.result,
                            accounts: resAccounts.data.result,
                        })
                    })
                    .catch((err) => {
                        console.log(err)
                    });
                })
                .catch((err) => {
                    console.log(err)
                });
            })
            .catch((err) => {
                console.log(err)
            });
        })
        .catch((err) => {
            console.log(err)
        });

    }

    // Function that returns a component to be drawn, can have children components if the parent component supports it
    render() {

        const createEmailButtonHandler = (id:number) => {

            let quote;
            for (let i = 0; i < this.state.quotes.length; i++) {
                if (id == this.state.quotes[i]['ID']) {
                    quote = this.state.quotes[i];
                    break;
                }
            }

            let patient:any;

            for (let i = 0; i < this.state.patients.length; i++) {
                if (this.state.patients[i]["ID"] == quote['Patient']) {
                    patient = this.state.patients[i];
                    break;
                }
            }

            let data = {
                patientName: patient["FirstName"] + " " + patient['LastName'],
                patientNHI: patient['NHI'],
                patientDOB: patient['DOB'],
                patientContactNumber: patient['ContactNumber'],
                patientEmailAddress: patient['Email']
            }

            let newLine = "%0D%0A";

            let subject = "Information about Quote " + id + " for " + data.patientName + ".";
            let body = "Quote ID: " + id + newLine + 
            "Quote Payment Status: " + this.state.selectedPaymentStatus + newLine +
            "Quote Payment Deadline: " + this.state.selectedPaymentDeadline + newLine +
            "Quote Total Cost: " + this.state.selectedTotalCost + newLine + 
            
            "Booking Date: " + this.state.selectedBookingDate + newLine +
            "Booking Time: " + this.state.selectedBookingTime + newLine + 
            "Booking Location: " + this.state.selectedBookingLocation + newLine +
            "Booking Notes: " + this.state.selectedBookingNotes + newLine +
            "Booking Procedure:  " + this.state.selectedBookingProcedure + newLine;

            generateEmailReferral(data, subject, body)

        }

        const setSelectedQuoteData = (id:number) => {

            let quote;
            for (let i = 0; i < this.state.quotes.length; i++) {
                if (id == this.state.quotes[i]['ID']) {
                    quote = this.state.quotes[i];
                    break;
                }
            }

            let patient:any;
            let booking:any;
            let dentist:any;

            for (let i = 0; i < this.state.patients.length; i++) {
                if (this.state.patients[i]["ID"] == quote['Patient']) {
                    patient = this.state.patients[i];
                    break;
                }
            }

            for (let i = 0; i < this.state.bookings.length; i++) {
                if (this.state.bookings[i]["ID"] == quote['Booking']) {
                    booking = this.state.bookings[i];
                    break;
                }
            }

            for (let i = 0; i < this.state.accounts.length; i++) {
                if (this.state.accounts[i]["ID"] == quote['Dentist']) {
                    dentist = this.state.accounts[i];
                    break;
                }
            }

            console.log(quote)

            this.setState({
                selectedQuoteID: id,
                selectedPaymentStatus: quote['QuotePaymentStatus'],
                selectedPaymentDeadline: quote['QuotePaymentDeadline'],
                selectedTotalCost: quote['QuoteTotalCostDollars'] + "." + quote['QuoteTotalCostCents'],
                selectedPatientName: patient['FirstName'] + " " + patient['MiddleName'] + " " + patient['LastName'],
                selectedPatientNHI: patient['NHI'],
                selectedPatientDOB: patient['DOB'],
                selectedPatientContactNumber: patient['ContactNumber'],
                selectedPatientEmailAddress: patient['Email'],
                selectedBookingID: booking['ID'],
                selectedBookingDate: booking['Date'],
                selectedBookingTime: booking['Time'],
                selectedBookingDentistName: dentist['AccountName'],
                selectedBookingLocation: booking['Location'],
                selectedBookingNotes: booking['Notes'],
                selectedBookingProcedure: booking['ProcedureName']
            })

        } 

        const createPDFButtonHandler = (quoteData:any):any => {

            let patient:any;
            let booking:any;
            let dentist:any;

            for (let i = 0; i < this.state.patients.length; i++) {
                if (this.state.patients[i]["ID"] == quoteData['Patient']) {
                    patient = this.state.patients[i];
                    break;
                }
            }

            for (let i = 0; i < this.state.bookings.length; i++) {
                if (this.state.bookings[i]["ID"] == quoteData['Booking']) {
                    booking = this.state.bookings[i];
                    break;
                }
            }

            for (let i = 0; i < this.state.accounts.length; i++) {
                if (this.state.accounts[i]["ID"] == quoteData['Dentist']) {
                    dentist = this.state.accounts[i];
                    break;
                }
            }

            let fileDialog = new QFileDialog();
            fileDialog.setFileMode(FileMode.Directory);
            fileDialog.setNameFilter('text (*txt)');
            fileDialog.exec();
            let selectedFiles = fileDialog.selectedFiles();
            selectedFiles.map((file)=>{
                let data = {
                    id: quoteData['ID'],
                    date: new Date().toString().split(" (")[0],
                    paymentStatus: quoteData['QuotePaymentStatus'],
                    paymentDeadline: quoteData['QuotePaymentDeadline'],
                    totalCost: quoteData['QuoteTotalCostDollars'] + "." + quoteData['QuoteTotalCostCents'],
                    patientName: patient['FirstName'] + " " + patient['MiddleName'] + " " + patient['LastName'],
                    patientNHI: patient['NHI'],
                    patientDOB: patient['DOB'],
                    patientContactNumber: patient['ContactNumber'],
                    patientEmailAddress: patient['Email'],
                    bookingID: booking['ID'],
                    bookingDate: booking['Date'],
                    bookingTime: booking['Time'],
                    bookingDentistName: dentist['AccountName'],
                    bookingLocation: booking['Location'],
                    bookingNotes: booking['Notes'],
                    bookingProcedure: booking['ProcedureName']
                };
                createPDF(data, file + "/Quote_" + quoteData['ID'] + "_Booking_" + booking['ID'] + ".pdf");
            })
        }

        const quoteList = this.state.quotes;
        let quoteViews = [];
        let quoteButton = [];

        for (let i in quoteList) {
            quoteViews.push(
            <View>
                <Button text={quoteList[i]['ID']} on={
                    {
                        clicked: () => {setSelectedQuoteData(quoteList[i]['ID'])}
                    }
                }></Button>
            </View>
            )
            quoteButton.push(
                <View>
                    <Button text={"Export Quote as PDF"} on={
                        {
                            clicked: () => {createPDFButtonHandler(quoteList[i])}
                        }
                    }></Button>
                </View>
            )
        }

        const textStyle = "color: 'black'; font-size: 35px;";

        return (

                <View style="flex: auto;">
                    <View style="flex: auto; flex-direction: 'row';">
                        <View style="flex: 1; background-color: 'grey';">
                            <Text style={textStyle}>Selectable List of Quotes: </Text>
                            <View style="flex: auto;">
                                {quoteViews}
                            </View>
                        </View>
                        <View style="flex: 2; flex-direction: 'column';">
                            <Text style={textStyle}>Quote ID: {this.state.selectedQuoteID}</Text>
                            <Text style={textStyle}>Quote Payment Status: {this.state.selectedPaymentStatus}</Text>
                            <Text style={textStyle}>Quote Payment Deadline: {this.state.selectedPaymentDeadline}</Text>
                            <Text style={textStyle}>Quote Total Cost: {this.state.selectedTotalCost}</Text>

                            <Text style={textStyle}>Patient NHI: {this.state.selectedPatientNHI}</Text>
                            <Text style={textStyle}>Patient Name: {this.state.selectedPatientName}</Text>
                            <Text style={textStyle}>Patient Date of Birth: {this.state.selectedPatientDOB}</Text>
                            <Text style={textStyle}>Patient Contact Number: {this.state.selectedPatientNumber}</Text>
                            <Text style={textStyle}>Patient Email Address: {this.state.selectedPatientEmail}</Text>
                            <Text style={textStyle}>Patient Notes: {this.state.selectedPatientNotes}</Text>
                            
                            <Text style={textStyle}>Booking Date: {this.state.selectedBookingDate}</Text>
                            <Text style={textStyle}>Booking Time: {this.state.selectedBookingTime}</Text>
                            <Text style={textStyle}>Booking Location: {this.state.selectedBookingLocation}</Text>
                            <Text style={textStyle}>Booking Notes: {this.state.selectedBookingNotes}</Text>
                            <Text style={textStyle}>Booking Procedure: {this.state.selectedBookingProcedure}</Text>
                            
                            <Button text={"Export Quote as PDF"} enabled={(this.state.selectedQuoteID != null)} on={
                                {
                                    clicked: () => {createPDFButtonHandler(this.state.selectedQuoteID)}
                                }
                            }></Button>

                            <Button text={"Email Quote to Patient"} enabled={(this.state.selectedQuoteID != null)} on={
                                {
                                    clicked: () => {createEmailButtonHandler(this.state.selectedQuoteID)}
                                }
                            }></Button>
                        </View>
                    </View>
                </View>
        );
    }
} 

export default QuoteViewer;
