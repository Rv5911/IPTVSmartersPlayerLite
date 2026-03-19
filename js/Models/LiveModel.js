"use strict";
var LiveModel={
    movies:[],
    category_name:'live_categories',
    favourite_movie_count:200,
    recent_movie_count:5,
    movie_key:"stream_id",
    categories:[],
    programmes:{},
    favourite_ids:[],
    programme_saved:false,
    recent_channel_ids:[],
    saveProgrammes: function (programmes, stream_id) {
        var that=this;
        that.programmes = programmes;
        that.programme_saved=true;
        that.insertProgrammesToChannels(stream_id)
    },
    insertProgrammesToChannels: function (stream_id) {
        var channel_programmes = this.programmes;
        var movies = this.getAllMovies();
        for (var i = 0; i < movies.length; i++) {
            try{
                if (movies[i][stream_id] != null && movies[i][stream_id] !== "") {
                    var key=movies[i][stream_id].toString();
                    var programmes = typeof channel_programmes[key]!="undefined" ? channel_programmes[key] : [];
                    programmes.sort(function (a, b) {
                        return a.start.localeCompare(b.start)
                    });
                    movies[i].programmes = programmes;
                } else {
                    movies[i].programmes = [];
                }
            }catch(e){
            }
        }
        this.movies = movies;
    },
    getAllMovies:function(){
        var movies=this.movies;
        return movies;
    },
    getProgrammeVideoUrl:function(channel_id,programme){
        if(settings.playlist_type==='xtreme'){
            var start_time_obj=moment(programme.start,'YYYYMMDDHHmmss Z');
            var stop_time_obj=moment(programme.stop,'YYYYMMDDHHmmss Z');
            var start_time=start_time_obj.format('Y-MM-DD:HH-mm');
            var stop_time=stop_time_obj.format('Y-MM-DD:HH-mm');
            var duration=getMinute(stop_time_obj.format('Y-MM-DD HH:mm:ss'))-getMinute(start_time_obj.format('Y-MM-DD HH:mm:ss'));
            var url=api_host_url+"/"+"streaming/timeshift.php?username="+user_name+"&password="+password+
                "&stream="+channel_id+"&start="+start_time+"&duration="+duration;
            return {
                duration:duration,
                url:url
            }
        }
        else{
            return {
                duration:'00:00',
                url:''
            }
        }
    },
    getCurrentProgram:function(movie){
        var date=moment(new Date());
        var date_string=date.format('Y-MM-DD HH:mm:ss');
        var programmes=movie.programmes;
        var current_program=null;
        for(var  i=0;i<programmes.length;i++){
            var stop=convertProgrammeTimeToClientTime(programmes[i].stop);
            if(stop>=date_string){
                var start=convertProgrammeTimeToClientTime(programmes[i].start)
                if(start<=date_string){
                    current_program=programmes[i];
                }
                break;
            }
        }
        return current_program;
    },
    getProgrammeProgressBarWidth:function (start, stop,current_time) {
        var stop_time_stamp=new Date(stop).getTime();
        var start_time_stamp=new Date(start).getTime();
        var duration=(stop_time_stamp-start_time_stamp);
        var percent=(current_time-start_time_stamp)/duration*100;
        return percent;
    },
    getProgramDesc:function (programme) {
        var desc='';
        var desc_obj=programme.desc;
        try{
            desc=desc_obj[0].childNodes[0].nodeValue;
        }catch (e) {
        }
        return desc;
    },
    getNextProgrammes:function(programmes){
        var current_program_exist=false;
        var next_programmes=[];
        var current_time=moment(new Date()).unix();
        var k=0;
        for(var i=0;i<programmes.length;i++){
            var item=programmes[i];
            var stop=getLocalChannelTime(item.stop).unix();
            if(stop>=current_time){
                k++;
                var start=getLocalChannelTime(item.start).unix();
                if(start<=current_time)
                    current_program_exist=true;
                next_programmes.push(programmes[i]);
            }
            if(k>=4)
                break;
        }
        return {
            current_program_exist:current_program_exist,
            programmes:next_programmes
        }
    }
}
