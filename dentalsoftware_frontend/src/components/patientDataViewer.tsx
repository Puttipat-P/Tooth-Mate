import { Text, View, Button, LineEdit } from "@nodegui/react-nodegui";
import {  WidgetEventTypes } from "@nodegui/nodegui";
import TicketCreator from "./TicketCreator";
import React from "react";
import axios from 'axios';
import Loading from "./loading";

export class PatientDataViewer extends React.Component<any, any> {

    constructor(props: any) {
        super(props);

        this.state = {
            patients: null,
            bookings: null,
            edit: false
        }

        axios.post('http://localhost:3000/patients/getAllPatientData')
        .then((res) => {
            axios.post('http://localhost:3000/bookings/getAllBookings')
            .then((resBookings) => {

                this.setState({
                    patients: res.data.result,
                    bookings: resBookings.data.result,
                    selectedPatientID: null,
                    selectedPatientNHI: null,
                    selectedPatientName: null,
                    selectedPatientDOB: null,
                    selectedPatientNumber: null,
                    selectedPatientEmail: null,
                    selectedPatientNotes: null,
                    selectedLastBooking: null,
                    selectedNextBooking: null,
                    offset: 0
                })

            })
            .catch((err) => {
                console.log(err)
            });
        })
        .catch((err) => {
            console.log(err)
        });

    }

    buttonHandler = (index: number) => {
        const patient = this.state.patients[index];
        let currentDate = new Date();
        let booking = [];
        let lastBooking;
        let nextBooking;

        for (let i = 0; i < this.state.bookings.length; i++) {
            if (this.state.bookings[i]['Patient'] == patient['ID']) {
                booking.push(this.state.bookings[i]);
            }
        }

        for (let i = 0; i < booking.length; i++) {
            let tempDate = new Date(booking[i]['Date']);
            if (tempDate < currentDate) {
                lastBooking = booking[i]['Date'];
            } else if (tempDate > currentDate) {
                nextBooking = booking[i]['Date'];
            }
        }

        if (lastBooking == undefined) {
            lastBooking = "No previous bookings!"
        }

        if (nextBooking == undefined) {
            nextBooking = "No upcoming bookings!"
        }

        this.setState({
            selectedPatientID: patient['ID'],
            selectedPatientNHI: patient['NHI'],
            selectedPatientName: patient['FirstName'] + " " + patient['LastName'],
            selectedPatientDOB: patient['DOB'],
            selectedPatientNumber: patient['ContactNumber'],
            selectedPatientEmail: patient['Email'],
            selectedPatientNotes: patient['Notes'],
            selectedLastBooking: lastBooking,
            selectedNextBooking: nextBooking,
            selectedIndex: index
        })
    }

    changeEdit = () => {
        this.setState({
            edit: false
        })
    }

    lowerOffset = () => {
        if (this.state.offset >= 5) { 
            this.setState({
                offset: this.state.offset - 5
            })
        }
    }

    raiseOffset = () => {
        if (this.state.offset <= this.state.patients.length) {
            this.setState({
                offset: this.state.offset + 5
            })
        }
    }

    // Function that returns a component to be drawn, can have children components if the parent component supports it
    render() {

        if (this.state.patients == null) {
            return (<Loading/>)
        }

        const patientList = this.state.patients;
        let patientListStrings = [];

        for (let i in patientList) {
            patientListStrings.push(<Button id="button" text={patientList[i].FirstName + " " + patientList[i].LastName} on={
                    {
                        // Only trigger when left click is released
                        [WidgetEventTypes.MouseButtonRelease]: () => this.buttonHandler(Number(i)),
                    }
                }/>
            )
        }
        let displayButtons = [];
        for (let i = this.state.offset; i < this.state.offset + 5; i++) {
            displayButtons.push(patientListStrings[i])
        }

        const selectedPatientNHI = this.state.selectedPatientNHI;
        const selectedPatientName = this.state.selectedPatientName;
        const selectedPatientDOB = this.state.selectedPatientDOB;
        const selectedPatientNumber = this.state.selectedPatientNumber;
        const selectedPatientEmail = this.state.selectedPatientEmail;
        const selectedPatientNotes = this.state.selectedPatientNotes;

        const selectedPatientLastBooking = this.state.selectedLastBooking;
        const selectedPatientNextBooking = this.state.selectedNextBooking;

        const textStyle = "color: 'black'; font-size: 35px;";

        if (this.state.edit) {

            return <TicketCreator patient={this.state.selectedPatientID} patients={this.state.patients} changeEdit={this.changeEdit}/>

        } else {
            return (
                <View id="mainView" style="flex: auto;">
                    <View id="mainView" style="flex: auto; flex-direction: 'row';">
                        <View style="flex: 1; background-color: 'grey';">
                            <Text id="titleCenterAlign" style={textStyle}>Patients</Text>
                            <View style="flex: auto;">
                                <Button id="button" text="↑" enabled={this.state.offset != 0} on={{pressed: this.lowerOffset}}/>
                                {displayButtons}
                                <Button id="button" text="↓" enabled={this.state.offset + 5 < this.state.patients.length} on={{pressed: this.raiseOffset}}/>
                            </View>
                        </View>
    
                        <View id="mainViewTransparent" style="flex: 2; flex-direction: 'column';">
                            <Text style={textStyle}>Patient NHI: {selectedPatientNHI}</Text>
                            <Text style={textStyle}>Patient Name: {selectedPatientName}</Text>
                            <Text style={textStyle}>Patient Date of Birth: {selectedPatientDOB}</Text>
                            <Text style={textStyle}>Patient Contact Number: {selectedPatientNumber}</Text>
                            <Text style={textStyle}>Patient Email Address: {selectedPatientEmail}</Text>
                            <Text style={textStyle}>Patient Notes: {selectedPatientNotes}</Text>
                        </View>
    
                        <View id="mainViewTransparent" style="flex: 2; flex-direction: 'column';">
                            <Text style={textStyle}>{selectedPatientName}'s Last Booking: {selectedPatientLastBooking}</Text>
                            <Text style={textStyle}>{selectedPatientName}'s Next Booking: {selectedPatientNextBooking}</Text>
                        </View>
    
                        <View id="mainViewTransparent" style="flex: 2; flex-direction: 'column';">
                            <Button style="flex: 1; color: 'black'; font-size: 35px;" visible={selectedPatientNHI == null ? false : true} text={"Create Ticket"} on={
                                {
                                    // Only trigger when left click is released
                                    [WidgetEventTypes.MouseButtonRelease]: () => this.setState({edit: true}),
                                }
                            }/>
                        </View>
                    </View>
                </View>
            );
        }
    }
} 

export default PatientDataViewer;
