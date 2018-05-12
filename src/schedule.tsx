import { Button, Spinner, Intent } from '@blueprintjs/core';
import * as classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import * as qs from 'qs';

import { PROXY_SERVER_URL } from './App';
import { stations } from './stations';

interface ITrip {
    departure: string;
    transfer: string;
    arrival: string;
    time: string;
}

interface IScheduleState {
    trips?: ITrip[];
}

type IScheduleProps = RouteComponentProps<{}>;

export class Schedule extends React.Component<IScheduleProps, IScheduleState> {

    public constructor(props: IScheduleProps) {
        super(props);
        this.state = {};
    }

    public componentDidMount() {
        this.issueQuery();
    }

    public componentDidUpdate(prevProps: IScheduleProps) {
        if (this.props !== prevProps) {
            this.issueQuery();
        }
    }

    public render() {
        if (this.state.trips === undefined) {
            return (
                <div className="schedule-container">
                    <Spinner />
                </div>
            );
        }

        const transfers = this.state.trips.filter((trip) => trip.transfer !== undefined).length > 0;

        const { origin, destination, date } = this.getQuery();

        return (
            <div className="schedule-container">
                <div className={classNames(['schedule', 'pt-card'])}>
                    <div style={{ marginBottom: '20px' }}> 
                        <p> {new Date(date).toDateString()} </p>
                        <h6> {origin.name} to {destination.name} </h6>
                        <Button text="Swap" iconName="swap-horizontal" intent={Intent.PRIMARY} onClick={this.onSwap} />
                    </div>
                    <table className="pt-table pt-striped schedule-table">
                        <thead>
                        <tr>
                            <th>Departure</th>
                            {transfers ? <th>Transfer</th> : null}
                            <th>Arrival</th>
                            <th>Travel time </th>
                        </tr>
                        </thead>
                        <tbody>
                            {this.state.trips.map((trip) => {
                                return (
                                    <tr key={trip.departure}>
                                        <td>{trip.departure}</td>
                                        {transfers ? <td>{trip.transfer}</td> : null}
                                        <td>{trip.arrival}</td>
                                        <td>{trip.time}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    private getQuery = () => {
        const params = new URLSearchParams(this.props.location.search);
        const origin = params.get('origin');
        const destination = params.get('destination');

        return {
            origin: stations.filter((station) => station.key === origin)[0],
            destination: stations.filter((station) => station.key === destination)[0],
            date: params.get('date'),
        };
    }

    private issueQuery = () => {
        const { origin, destination, date } = this.getQuery();
        const formData = qs.stringify({
            selOrigin: origin.key,
            selDestination: destination.key,
            datepicker: date,
            OriginDescription: origin.name,
            DestDescription: destination.name,
        });
        
        fetch(
            PROXY_SERVER_URL + 'http://www.njtransit.com/sf/sf_servlet.srv?hdnPageAction=TrainSchedulesFrom',
            {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        )
        .then((response) => response.text())
        .then((content) => {
            const parser = new DOMParser();
            const html = parser.parseFromString(content, 'text/html');
            const table = html.getElementsByTagName('table')[7];
            const rows = Array.from(table.getElementsByTagName('tr')).slice(1);
            this.setState({
                trips: rows.map((row) => {
                    const cells = row.getElementsByTagName('td');
                    const transfers = cells.length === 4;
                    return {
                        departure: cells[0].innerText,
                        transfer: transfers ? cells[1].innerText : undefined,
                        arrival: cells[transfers ? 2 : 1].innerText,
                        time: cells[transfers ? 3 : 2].innerText,
                    };
                }),
            });
        });
    }

    private onSwap = () => {
        this.setState({
            trips: undefined,
        });
        const { origin, destination, date } = this.getQuery();
        this.props.history.push(`/schedule?origin=${destination.key}&destination=${origin.key}&date=${date}`);
    }
}
