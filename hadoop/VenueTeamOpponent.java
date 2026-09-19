import java.io.IOException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class VenueTeamOpponent {

    public static class MapperClass
            extends Mapper<Object, Text, Text, Text> {

        private Text outKey = new Text();
        private Text outValue = new Text();

        public void map(Object key, Text value, Context context)
                throws IOException, InterruptedException {

            String line = value.toString();

            if (line.startsWith("id,"))
                return;

            String[] f = parseCSV(line);

            if (f.length < 13)
                return;

            String venue = f[6].trim();
            String team1 = f[7].trim();
            String team2 = f[8].trim();
            String tossWinner = f[9].trim();
            String tossDecision = f[10].trim();
            String winner = f[11].trim();

            if (venue.isEmpty() || team1.isEmpty() || team2.isEmpty()
                    || winner.isEmpty())
                return;

            // Create TWO directional records:
            //
            // team1 perspective
            emitRecord(context, venue, team1, team2,
                    tossWinner, tossDecision, winner, team1);

            // team2 perspective
            emitRecord(context, venue, team2, team1,
                    tossWinner, tossDecision, winner, team2);
        }


        /*
         * Proper CSV parser.
         * Handles commas inside quoted fields, e.g.
         * "Arun Jaitley Stadium, Delhi"
         */
        private String[] parseCSV(String line) {

            java.util.ArrayList<String> fields =
                    new java.util.ArrayList<String>();

            StringBuilder current = new StringBuilder();
            boolean inQuotes = false;

            for (int i = 0; i < line.length(); i++) {

                char c = line.charAt(i);

                if (c == '"') {

                    if (inQuotes &&
                        i + 1 < line.length() &&
                        line.charAt(i + 1) == '"') {

                        current.append('"');
                        i++;

                    } else {
                        inQuotes = !inQuotes;
                    }

                } else if (c == ',' && !inQuotes) {

                    fields.add(current.toString().trim());
                    current.setLength(0);

                } else {

                    current.append(c);
                }
            }

            fields.add(current.toString().trim());

            return fields.toArray(new String[0]);
        }

        private void emitRecord(Context context,
                                String venue,
                                String team,
                                String opponent,
                                String tossWinner,
                                String tossDecision,
                                String winner,
                                String perspectiveTeam)
                throws IOException, InterruptedException {

            int matchWin = winner.equals(perspectiveTeam) ? 1 : 0;
            int matchLoss = matchWin == 1 ? 0 : 1;

            int tossWin = tossWinner.equals(perspectiveTeam) ? 1 : 0;
            int tossLoss = tossWin == 1 ? 0 : 1;

            int tossWinMatchWin =
                    (tossWin == 1 && matchWin == 1) ? 1 : 0;

            int tossWinMatchLoss =
                    (tossWin == 1 && matchLoss == 1) ? 1 : 0;

            int batFirst =
                    (tossWin == 1 && tossDecision.equals("bat")) ? 1 : 0;

            int fieldFirst =
                    (tossWin == 1 && tossDecision.equals("field")) ? 1 : 0;

            int batFirstWin =
                    (batFirst == 1 && matchWin == 1) ? 1 : 0;

            int fieldFirstWin =
                    (fieldFirst == 1 && matchWin == 1) ? 1 : 0;

            String key =
                    venue + "\t" + team + "\t" + opponent;

            String val =
                    "1," +
                    matchWin + "," +
                    matchLoss + "," +
                    tossWin + "," +
                    tossLoss + "," +
                    tossWinMatchWin + "," +
                    tossWinMatchLoss + "," +
                    batFirst + "," +
                    batFirstWin + "," +
                    fieldFirst + "," +
                    fieldFirstWin;

            outKey.set(key);
            outValue.set(val);

            context.write(outKey, outValue);
        }
    }

    public static class ReducerClass
            extends Reducer<Text, Text, Text, Text> {

        public void reduce(Text key, Iterable<Text> values,
                            Context context)
                throws IOException, InterruptedException {

            int matches = 0;
            int wins = 0;
            int losses = 0;
            int tossWins = 0;
            int tossLosses = 0;
            int tossWinMatchWins = 0;
            int tossWinMatchLosses = 0;
            int batFirst = 0;
            int batFirstWins = 0;
            int fieldFirst = 0;
            int fieldFirstWins = 0;

            for (Text value : values) {

                String[] p = value.toString().split(",");

                matches += Integer.parseInt(p[0]);
                wins += Integer.parseInt(p[1]);
                losses += Integer.parseInt(p[2]);
                tossWins += Integer.parseInt(p[3]);
                tossLosses += Integer.parseInt(p[4]);
                tossWinMatchWins += Integer.parseInt(p[5]);
                tossWinMatchLosses += Integer.parseInt(p[6]);
                batFirst += Integer.parseInt(p[7]);
                batFirstWins += Integer.parseInt(p[8]);
                fieldFirst += Integer.parseInt(p[9]);
                fieldFirstWins += Integer.parseInt(p[10]);
            }

            double winPct =
                    matches == 0 ? 0.0 :
                    (wins * 100.0 / matches);

            double tossConversion =
                    tossWins == 0 ? 0.0 :
                    (tossWinMatchWins * 100.0 / tossWins);

            double batWinPct =
                    batFirst == 0 ? 0.0 :
                    (batFirstWins * 100.0 / batFirst);

            double fieldWinPct =
                    fieldFirst == 0 ? 0.0 :
                    (fieldFirstWins * 100.0 / fieldFirst);

            String result =
                    "Matches=" + matches +
                    "\tWins=" + wins +
                    "\tLosses=" + losses +
                    "\tWin%=" + String.format("%.2f", winPct) +
                    "\tTossWins=" + tossWins +
                    "\tTossLosses=" + tossLosses +
                    "\tTossWinMatchWins=" + tossWinMatchWins +
                    "\tTossWinMatchLosses=" + tossWinMatchLosses +
                    "\tTossConversion%=" +
                    String.format("%.2f", tossConversion) +
                    "\tBatFirst=" + batFirst +
                    "\tBatFirstWins=" + batFirstWins +
                    "\tBatFirstWin%=" +
                    String.format("%.2f", batWinPct) +
                    "\tFieldFirst=" + fieldFirst +
                    "\tFieldFirstWins=" + fieldFirstWins +
                    "\tFieldFirstWin%=" +
                    String.format("%.2f", fieldWinPct);

            context.write(key, new Text(result));
        }
    }

    public static void main(String[] args)
            throws Exception {

        Configuration conf = new Configuration();

        Job job = Job.getInstance(conf,
                "Venue Team Opponent Toss Analysis");

        job.setJarByClass(VenueTeamOpponent.class);

        job.setMapperClass(MapperClass.class);
        job.setReducerClass(ReducerClass.class);

        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(Text.class);

        FileInputFormat.addInputPath(
                job, new Path(args[0]));

        FileOutputFormat.setOutputPath(
                job, new Path(args[1]));

        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
