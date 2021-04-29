using Microsoft.VisualBasic.FileIO;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HashAssets
{
    class Program
    {
        public static MySql sql = null;

        static void Main(string[] args)
        {
            sql = new MySql(ConfigurationManager.AppSettings["SqlServer"],
                            ConfigurationManager.AppSettings["SqlDatabase"],
                            ConfigurationManager.AppSettings["SqlUsername"]);
            if (!sql.Connect()) throw new Exception("Invalid MySQL password.");

            if (!sql.RemoveAllRoms()) throw new Exception("Unable to remove existing roms from database");
            DeleteAllFiles(ConfigurationManager.AppSettings["DestinationCoversDirectory"]);
            DeleteAllFiles(ConfigurationManager.AppSettings["DestinationRomsDirectory"]);
            Directory.CreateDirectory(Path.Combine(ConfigurationManager.AppSettings["DestinationCoversDirectory"], "full"));
            Directory.CreateDirectory(Path.Combine(ConfigurationManager.AppSettings["DestinationCoversDirectory"], "front"));
            Directory.CreateDirectory(Path.Combine(ConfigurationManager.AppSettings["DestinationCoversDirectory"], "back"));

            foreach (string line in File.ReadLines(ConfigurationManager.AppSettings["MappingFile"]))
            {
                TextReader reader = new StringReader(line);
                TextFieldParser fieldParser = new TextFieldParser(reader);
                fieldParser.TextFieldType = Microsoft.VisualBasic.FileIO.FieldType.Delimited;
                fieldParser.SetDelimiters(",");

                string[] entries = fieldParser.ReadFields();
                string displayName = entries[0];
                string cover = entries[1];
                string rom = entries[2];

                sql.AddRomEntry(displayName, string.Empty, CreateCover(cover), CreateRom(rom));
            }
        }

        static string CreateCover(string sourceValue)
        {
            if (string.IsNullOrEmpty(sourceValue)) return string.Empty;

            string sourceFilename = Path.Combine(ConfigurationManager.AppSettings["SourceCoversDirectory"], sourceValue);
            string destinationValue = Guid.NewGuid().ToString();

            // full cover
            string destinationFullCoverFilename = Path.Combine(ConfigurationManager.AppSettings["DestinationCoversDirectory"], "full", destinationValue);
            File.Copy(sourceFilename, destinationFullCoverFilename);

            // front cover
            string destinationFrontCoverFilename = Path.Combine(ConfigurationManager.AppSettings["DestinationCoversDirectory"], "front", destinationValue);
            //File.Copy(sourceFilename, destinationFrontCoverFilename);
            CropImage(Image.FromFile(sourceFilename), 306, 420, 366, 0).Save(destinationFrontCoverFilename);

            // back cover
            string destinationBackCoverFilename = Path.Combine(ConfigurationManager.AppSettings["DestinationCoversDirectory"], "back", destinationValue);
            //File.Copy(sourceFilename, destinationBackCoverFilename);
            CropImage(Image.FromFile(sourceFilename), 306, 420, 0, 0).Save(destinationBackCoverFilename);

            return destinationValue;
        }

        static string CreateRom(string sourceValue)
        {
            string sourceFilename = Path.Combine(ConfigurationManager.AppSettings["SourceRomsDirectory"], sourceValue);
            string destinationValue = Guid.NewGuid().ToString();
            string destinationFilename = Path.Combine(ConfigurationManager.AppSettings["DestinationRomsDirectory"], destinationValue);

            File.Copy(sourceFilename, destinationFilename);
            return destinationValue;
        }

        static void DeleteAllFiles(string path)
        {
            Directory.CreateDirectory(path);
            foreach (FileInfo file in new DirectoryInfo(path).GetFiles())
            {
                file.Delete();
            }
        }

        static void RemoveUnreferencedRoms()
        {
            List<string> usedRoms = new List<string>();
            string romPath = ConfigurationManager.AppSettings["SourceRomsDirectory"];
            foreach (string line in File.ReadLines(ConfigurationManager.AppSettings["MappingFile"]))
            {
                TextReader reader = new StringReader(line);
                TextFieldParser fieldParser = new TextFieldParser(reader);
                fieldParser.TextFieldType = Microsoft.VisualBasic.FileIO.FieldType.Delimited;
                fieldParser.SetDelimiters(",");

                string[] entries = fieldParser.ReadFields();
                string displayName = entries[0];
                string cover = entries[1];
                string rom = entries[2];

                usedRoms.Add(rom);
            }

            foreach (FileInfo file in new DirectoryInfo(romPath).GetFiles())
            {
                if (!usedRoms.Contains(file.Name))
                {
                    file.Delete();
                }
            }
        }

        static void FindMissingRoms()
        {

            List<string> usedRoms = new List<string>();
            string romPath = ConfigurationManager.AppSettings["SourceRomsDirectory"];
            foreach (string line in File.ReadLines(ConfigurationManager.AppSettings["MappingFile"]))
            {
                TextReader reader = new StringReader(line);
                TextFieldParser fieldParser = new TextFieldParser(reader);
                fieldParser.TextFieldType = Microsoft.VisualBasic.FileIO.FieldType.Delimited;
                fieldParser.SetDelimiters(",");

                string[] entries = fieldParser.ReadFields();
                string rom = entries[2];

                if(!File.Exists(Path.Combine(romPath, rom)))
                {
                    Console.WriteLine(rom);
                }
            }
        }

        private static Image ResizeImage(int maxWidth, int maxHeight, Image Image)
        {
            return Image.GetThumbnailImage(maxWidth, maxHeight, null, IntPtr.Zero);
            int width = Image.Width;
            int height = Image.Height;
            if (width > maxWidth || height > maxHeight)
            {
                //The flips are in here to prevent any embedded image thumbnails -- usually from cameras
                //from displaying as the thumbnail image later, in other words, we want a clean
                //resize, not a grainy one.
                Image.RotateFlip(System.Drawing.RotateFlipType.Rotate180FlipX);
                Image.RotateFlip(System.Drawing.RotateFlipType.Rotate180FlipX);

                float ratio = 0;
                if (width > height)
                {
                    ratio = (float)width / (float)height;
                    width = maxWidth;
                    height = Convert.ToInt32(Math.Round((float)width / ratio));
                }
                else
                {
                    ratio = (float)height / (float)width;
                    height = maxHeight;
                    width = Convert.ToInt32(Math.Round((float)height / ratio));
                }

                //return the resized image
                return Image.GetThumbnailImage(width, height, null, IntPtr.Zero);
            }
            //return the original resized image
            return Image;
        }

        private static Image CropImage(Image Image, int Width, int Height, int StartAtX, int StartAtY)
        {
            Image outimage;
            MemoryStream mm = null;
            try
            {
                //check the image height against our desired image height
                if (Image.Height < Height) {
                    Height = Image.Height;
                }
         
                if (Image.Width < Width) {
                    Width = Image.Width;
                }
         
                //create a bitmap window for cropping
                Bitmap bmPhoto = new Bitmap(Width, Height, PixelFormat.Format24bppRgb);
                bmPhoto.SetResolution(72, 72);
         
                //create a new graphics object from our image and set properties
                Graphics grPhoto = Graphics.FromImage(bmPhoto);
                grPhoto.SmoothingMode = SmoothingMode.AntiAlias;
                grPhoto.InterpolationMode = InterpolationMode.HighQualityBicubic;
                grPhoto.PixelOffsetMode = PixelOffsetMode.HighQuality;
         
                //now do the crop
                grPhoto.DrawImage(Image, new Rectangle(0, 0, Width, Height), StartAtX, StartAtY, Width, Height, GraphicsUnit.Pixel);
         
                // Save out to memory and get an image from it to send back out the method.
                mm = new MemoryStream();
                bmPhoto.Save(mm, System.Drawing.Imaging.ImageFormat.Jpeg);
                bmPhoto.Dispose();
                grPhoto.Dispose();
                outimage = Image.FromStream(mm);
 
                return outimage;
            }
            catch (Exception ex)
            {
                throw new Exception("Error cropping image, the error was: " + ex.Message);
            }
        }

        private static Image RebuildImage(Image image, int middleX, int frontX, int newMiddleX, int newFrontX, int newWidth)
        {
            int oldHeight = image.Height;
            Image back = CropImage(image, middleX, oldHeight, 0, 0);
            Image middle = CropImage(image, frontX - middleX, oldHeight, middleX, 0);
            Image front = CropImage(image, image.Width - frontX, oldHeight, frontX, 0);

            Image newBack = ResizeImage(newMiddleX, oldHeight, back);
            Image newMiddle = ResizeImage(newFrontX - newMiddleX, oldHeight, middle);
            Image newFront = ResizeImage(newWidth - newFrontX, oldHeight, front);

            Bitmap bitmap = new Bitmap(newWidth, oldHeight);
            using (Graphics g = Graphics.FromImage(bitmap))
            {
                g.DrawImage(newBack, 0, 0);
                g.DrawImage(newMiddle, newMiddleX, 0);
                g.DrawImage(newFront, newFrontX, 0);
            }
            return bitmap;
        }
    }
}
