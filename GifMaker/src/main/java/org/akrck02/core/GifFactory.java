package org.akrck02.core;

import com.squareup.gifencoder.FloydSteinbergDitherer;
import com.squareup.gifencoder.GifEncoder;
import com.squareup.gifencoder.ImageOptions;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class GifFactory {

    /**
     * Create a gif from the frames in the resources directory
     * @param options the options to use
     */
    public static void create(Options options) {

        System.out.println("------------------------------------------------");
        System.out.println("             GIF FACTORY 1.0.0                  ");
        System.out.println("------------------------------------------------");

        if(options == null)
            options = new Options();

        List<File> frames = listFiles(options);

        if(frames.isEmpty()){
            System.out.println("No frames found. Exiting...");
            return;
        }

        // Order by number
        System.out.println("Ordering frames in memory...");
        frames.sort((f1, f2) -> {
            try {
                // get number from file name
                String f1Name = f1.getName();
                String f2Name = f2.getName();
                String f1Number = f1Name.substring(0, f1Name.indexOf("."));
                String f2Number = f2Name.substring(0, f2Name.indexOf("."));

                return Integer.parseInt(f1Number) - Integer.parseInt(f2Number);
            } catch (Exception e) {
                return 0;
            }
        });

        System.out.println("Setting options...");
        System.out.println(options.toString());

        try {
            BufferedImage i = ImageIO.read(frames.get(0));
            if(options.getWidth() == 0)
                options.setWidth(i.getWidth());

            if(options.getHeight() == 0)
                options.setHeight(i.getHeight());

        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        frames2Gif(options.getOutputName(), frames, options);

    }

    /**
     * List all the files in the resources directory
     * @return the list of files
     */
    private static List<File> listFiles(Options options) {

        File folder = new File(options.getInputPath());
        File[] listOfFiles = folder.listFiles();

        System.out.println("Listing files in " + options.getInputPath() + "...");

        if(listOfFiles == null){
            System.out.println("No files found. Exiting...");
            return new LinkedList<>();
        }

        List<File> files = new LinkedList<>();
        for (File file : listOfFiles) {
            if (file.isFile() && file.getName().endsWith(".png")) {
                files.add(file);
            }
        }

        return files;
    }


    /**
     * Create a gif from the frames
     * @param file the output file
     * @param frames the frames
     * @param frameOptions the options
     */
    public static void frames2Gif(String file, List<File> frames, Options frameOptions){

        System.out.println("Creating output directory...");
        File outputDir = new File(frameOptions.getOutputPath());

        if(!outputDir.exists()){
            System.out.println("Output directory does not exist. Creating...");
            boolean created = outputDir.mkdirs();
            if(!created){
                System.out.println("Could not create output directory. Exiting...");
                return;
            }
        }

        System.out.println("Creating GIF...");

        try (FileOutputStream outputStream = new FileOutputStream(outputDir + "/" + file)) {

            ImageOptions options = new ImageOptions();

            //Set ms between each frame
            options.setDelay(frameOptions.getDelay(), TimeUnit.MILLISECONDS);

            //Use Floyd Steinberg dithering as it yields the best quality
            options.setDitherer(FloydSteinbergDitherer.INSTANCE);

            //Create GIF encoder with same dimension as of the source images
            final GifEncoder[] encoder = {new GifEncoder(outputStream, frameOptions.getWidth(), frameOptions.getHeight(), 0)};

            //Add the images to the encoder
            frames.forEach( frame -> {
                System.out.println("Adding frame: " + frame);
                try {

                    long start_time = System.currentTimeMillis();
                    BufferedImage image = ImageIO.read(frame);

                    System.out.println("Image width: " + image.getWidth());
                    System.out.println("Image height: " + image.getHeight());

                    int[][] data = convertImageToArray(image);

                    encoder[0].addImage(data, options);

                    long end_time = System.currentTimeMillis();
                    long difference = end_time-start_time;
                    System.out.println("Time to add frame: " + difference/1000 + " seconds");


                } catch (IOException e) {
                    e.printStackTrace();
                }
            });

            //Start the encoding process
            encoder[0].finishEncoding();


        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        System.out.println("GIF created at: " + file);

        // remove frames
        frames.forEach(frame -> {
            boolean removed = frame.delete();
            if(!removed)
                System.out.println("Could not remove frame: " + frame);
        });

    }


    /**
     * Convert BufferedImage into RGB pixel array
     */
    public static int[][] convertImageToArray(BufferedImage bufferedImage) throws IOException {

        int[][] rgbArray = new int[bufferedImage.getHeight()][bufferedImage.getWidth()];
        for (int i = 0; i < bufferedImage.getHeight(); i++) {
            for (int j = 0; j < bufferedImage.getWidth(); j++) {
                rgbArray[i][j] = bufferedImage.getRGB(j, i);
            }
        }
        return rgbArray;
    }


}
