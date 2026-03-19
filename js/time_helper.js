"use strict";
function convertProgrammeTimeToClientTime(program_time){
    var date=moment(program_time,'YYYYMMDDHHmmss Z');
    date.utc().add(client_offset,'minute');
    var date_format=date.format('Y-MM-DD HH:mm:ss');
    return date_format;
}
function calculateTimeDifference(server_time, time_stamp) {
    var date_obj=new Date(server_time);
    time_difference_with_server=parseInt((time_stamp*1000-date_obj.getTime())/(60*1000))
}
function getLocalChannelTime(channel_time) {
    var date=moment(channel_time);
    return date.add(time_difference_with_server, 'minute');
}