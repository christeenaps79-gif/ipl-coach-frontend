import java.io.IOException;
import java.util.*;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class TopBatsmen {

    public static class MapperClass
            extends Mapper<Object, Text, Text, IntWritable> {

        private Text batter = new Text();
        private IntWritable runs = new IntWritable();

        public void map(Object key, Text value, Context context)
                throws IOException, InterruptedException {

            String line = value.toString();

            if (line.startsWith("match_id"))
                return;

            String[] fields = line.split(",", -1);

            if (fields.length >= 10) {
                batter.set(fields[6]);

                try {
                    runs.set(Integer.parseInt(fields[9]));
                    context.write(batter, runs);
                } catch (NumberFormatException e) {
                }
            }
        }
    }

    public static class ReducerClass
            extends Reducer<Text, IntWritable, Text, IntWritable> {

        private IntWritable result = new IntWritable();

        public void reduce(Text key, Iterable<IntWritable> values,
                           Context context)
                throws IOException, InterruptedException {

            int total = 0;

            for (IntWritable value : values)
                total += value.get();

            result.set(total);
            context.write(key, result);
        }
    }

    public static void main(String[] args) throws Exception {

        Configuration conf = new Configuration();

        Job job = Job.getInstance(conf, "Top IPL Batsmen");

        job.setJarByClass(TopBatsmen.class);

        job.setMapperClass(MapperClass.class);
        job.setReducerClass(ReducerClass.class);

        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(IntWritable.class);

        FileInputFormat.addInputPath(job, new Path(args[0]));
        FileOutputFormat.setOutputPath(job, new Path(args[1]));

        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
