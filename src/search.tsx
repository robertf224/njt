import * as classNames from 'classnames';
import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Classes, IconClasses, MenuItem } from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
import { Select, ISelectItemRendererProps } from '@blueprintjs/labs';

import { IStation } from './App';
import { stations } from './stations';

interface ISearchState {
    geolocatingOrigin: boolean;
    origin?: IStation;
    geolocatingDestination: boolean;
    destination?: IStation;
    date: Date;
    submitted: boolean;
}

const StationSelect = Select.ofType<IStation>();

export class Search extends React.Component<{}, ISearchState> {

    public constructor(props: {}) {
        super(props);
        this.state = { date: new Date(), submitted: false, geolocatingOrigin: false, geolocatingDestination: false };
    }

    public render() {
        const { origin, destination, date, submitted, geolocatingOrigin, geolocatingDestination } = this.state;
        if (submitted) {
            return (
                <Redirect
                    push={true}
                    to={{
                        pathname: '/schedule',
                        search:
                            `?origin=${origin.key}&destination=${destination.key}&date=${date.toLocaleDateString()}`,
                    }}
                />
            );
        }
        return (
            <div className="search-container">
                <div className={classNames(['search', 'pt-card'])}>
                    <div className={classNames(['pt-form-group', 'search-form'])}> 
                        <label className="pt-label"> Origin station </label>
                        <div className="pt-control-group search-item">
                            <StationSelect
                                className="pt-fill"
                                items={stations}
                                itemRenderer={this.renderStation}
                                itemPredicate={this.filterStation}
                                onItemSelect={this.onOriginChange}
                                popoverProps={{ popoverClassName: classNames(['station-popover']) }}
                            >
                                <Button
                                    disabled={geolocatingOrigin}
                                    className="pt-fill"
                                    style={{ borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }}
                                    rightIconName="caret-down"
                                    text={origin ? origin.name : 'Select a station'}
                                />
                            </StationSelect>
                            <Button
                                loading={geolocatingOrigin}
                                iconName={IconClasses.LOCATE}
                                onClick={this.onOriginGeolocation} 
                            />
                        </div>
                        <span style={{marginTop: 10}} />
                        <label className="pt-label"> Destination station </label>
                        <div className="pt-control-group search-item">
                            <StationSelect
                                className="pt-fill"
                                items={stations}
                                itemRenderer={this.renderStation}
                                itemPredicate={this.filterStation}
                                onItemSelect={this.onDestinationChange}
                                popoverProps={{ popoverClassName: classNames(['station-popover']) }}
                            >
                                <Button
                                    disabled={geolocatingDestination}
                                    className="pt-fill"
                                    style={{ borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }}
                                    rightIconName="caret-down"
                                    text={destination ? destination.name : 'Select a station'}
                                />
                            </StationSelect>
                            <Button
                                loading={geolocatingDestination}
                                iconName={IconClasses.LOCATE}
                                onClick={this.onDestinationGeolocation} 
                            />
                        </div>
                        <span style={{marginTop: 10}} />
                        <label className="pt-label"> Date of travel </label>
                        <DatePicker
                            value={this.state.date || new Date()}
                            onChange={this.onDateChange}
                        />
                        <span style={{marginTop: 20}} />
                        <Button
                            rightIconName={IconClasses.SEARCH}
                            className={classNames([Classes.INTENT_PRIMARY, 'search-button'])}
                            disabled={!origin || !destination || !date}
                            onClick={() => this.setState({ submitted: true })}
                        >
                            Search
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    private renderStation({ handleClick, isActive, item: station }: ISelectItemRendererProps<IStation>) {
        const classes = classNames({
            [Classes.ACTIVE]: isActive,
            [Classes.INTENT_PRIMARY]: isActive,
        });
        return (
            <MenuItem
                className={classes}
                key={station.key}
                onClick={handleClick}
                text={station.name}
            />
        );
    }

    private filterStation(query: string, station: IStation, index: number) {
        return station.name.toLowerCase().includes(query.toLowerCase());
    }

    private onOriginChange = (station: IStation) => this.setState({ origin: station });
    private onDestinationChange = (station: IStation) => this.setState({ destination: station });
    private onDateChange = (date: Date) => this.setState({ date });
    private onOriginGeolocation = () => {
        this.setState({
            geolocatingOrigin: true,
        });
        navigator.geolocation.getCurrentPosition((position) => {
            this.setState({
                origin: findClosestStation(position),
                geolocatingOrigin: false,
            });
        });
    }
    private onDestinationGeolocation = () => {
        this.setState({
            geolocatingDestination: true,
        });
        navigator.geolocation.getCurrentPosition((position) => {
            this.setState({
                destination: findClosestStation(position),
                geolocatingDestination: false,
            });
        });
    }
}

const findClosestStation = (position: Position): IStation => {
    let minDistanceStation = stations[0];
    let minDistance =
        haversineDistance(position.coords.latitude, position.coords.longitude, stations[0].lat, stations[0].lon);
    stations.forEach((station, index) => {
        const distance =
            haversineDistance(position.coords.latitude, position.coords.longitude, station.lat, station.lon);
        if (distance < minDistance) {
            minDistance = distance;
            minDistanceStation = station;
        }
    });
    return minDistanceStation;
};

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p) / 2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p)) / 2;
  
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
};
