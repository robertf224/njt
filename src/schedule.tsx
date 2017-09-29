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
        const params = new URLSearchParams(this.props.location.search);
        const origin = params.get('origin');
        const destination = params.get('destination');
        const formData = qs.stringify({
            selOrigin: origin,
            selDestination: destination,
            datepicker: params.get('date'),
            OriginDescription: stations.filter((station) => station.key === origin)[0].name,
            DestDescription: stations.filter((station) => station.key === destination)[0].name,
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
                    return {
                        departure: cells[0].innerText,
                        transfer: cells[1].innerText,
                        arrival: cells[2].innerText,
                        time: cells[3].innerText,
                    };
                }),
            });
        });
    }

    public render() {
        if (this.state.trips === undefined) {
            return <div> Loading... </div>;
        }

        return (
            <div className="schedule-container">
                <div className={classNames(['schedule', 'pt-card'])}>
                    <table className="pt-table pt-striped">
                        <thead>
                        <tr>
                            <th>Departure</th>
                            <th>Transfer</th>
                            <th>Arrival</th>
                            <th>Travel time </th>
                        </tr>
                        </thead>
                        <tbody>
                            {this.state.trips.map((trip) => {
                                return (
                                    <tr key={trip.departure}>
                                        <td>{trip.departure}</td>
                                        <td>{trip.transfer}</td>
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
}
