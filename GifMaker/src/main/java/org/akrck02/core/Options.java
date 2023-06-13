package org.akrck02.core;

public class Options {
    private int width, height, delay;
    private String outputName, inputPath, outputPath;

    public Options() {
        this.width = 0;
        this.height = 0;
        this.delay = 1;
        this.outputName = "animation.gif";
        this.inputPath = "assets/";
        this.outputPath = "output/";
    }

    public int getWidth() {
        return width;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public int getHeight() {
        return height;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getDelay() {
        return delay;
    }

    public void setDelay(int delay) {
        this.delay = delay;
    }

    public String getOutputName() {
        return outputName;
    }

    public void setOutputName(String outputName) {
        this.outputName = outputName;
    }

    public String getInputPath() {
        return inputPath;
    }

    public void setInputPath(String inputPath) {
        this.inputPath = inputPath;
    }

    public String getOutputPath() {
        return outputPath;
    }

    public void setOutputPath(String outputPath) {
        this.outputPath = outputPath;
    }

    public String toString() {
        return "Options: width=" + width + ", height=" + height + ", delay=" + delay + ", outputName=" + outputName;
    }

    public static Options defaultInstance() {
        return new Options();
    }
}
