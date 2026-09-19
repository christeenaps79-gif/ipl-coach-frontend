import java.io.IOException;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class TeamRuns {

    public static class TeamRunsMapper
            extends Mapper<Object, Text, Text, IntWritable> {

        private Text team = new Text();
        private IntWritable runs = new IntWritable();

        public void map(Object key, Text value, Context context)
                throws IOException, InterruptedException {

            String line = value.toString();

            if (line.startsWith("match_id")) {
                return;
            }

            String[] fields = line.split(",", -1);

            if (fields.length >= 12) {
                team.set(fields[2]);

                try {
                    runs.set(Integer.parseInt(fields[11]));
                    context.write(team, runs);
                } catch (NumberFormatException e) {
                    // Ignore invalid rows
                }
            }
        }
    }

    public static class TeamRunsReducer
            extends Reducer<Text, IntWritable, Text, IntWritable> {

        private IntWritable result = new IntWritable();

        public void reduce(Text key, Iterable<IntWritable> values,
                           Context context)
                throws IOException, InterruptedException {

            int total = 0;

            for (IntWritable value : values) {
                total += value.get();
            }

            result.set(total);
            context.write(key, result);
        }
    }

    public static void main(String[] args) throws Exception {

        Configuration conf = new Configuration();

        Job job = Job.getInstance(conf, "Team Wise Total Runs");

        job.setJarByClass(TeamRuns.class);

        job.setMapperClass(TeamRunsMapper.class);
        job.setReducerClass(TeamRunsReducer.class);

        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(IntWritable.class);

        FileInputFormat.addInputPath(job, new Path(args[0]));
        FileOutputFormat.setOutputPath(job, new Path(args[1]));

        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
