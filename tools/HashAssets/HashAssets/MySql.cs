using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HashAssets
{
    public class MySql
    {
        private string server { get; set; }
        private string database { get; set; }
        private string username { get; set; }
        private string password { get; set; }

        private MySqlConnection connection { get; set; }

        public MySql(string server, string database, string username)
        {
            this.server = server;
            this.database = database;
            this.username = username;
        }

        public bool Connect()
        {
            if (string.IsNullOrEmpty(this.server)) throw new Exception("A server name is required to connect to a database.");
            if (string.IsNullOrEmpty(this.database)) throw new Exception("A database name is required to connect to a database.");
            if (string.IsNullOrEmpty(this.username)) throw new Exception("A username is required to connect to a database.");

            Console.WriteLine("Enter your passowrd for database: {0} and press Enter.\n", this.database);
            this.password = Console.ReadLine();

            string connectionString = string.Format("SERVER={0};DATABASE={1};UID={2};PASSWORD={3};",
                                                this.server, this.database, this.username, this.password);

            this.connection = new MySqlConnection(connectionString);

            return this.connection != null;
        }

        public bool RemoveAllRoms()
        {
            try
            {
                connection.Open();
                using (MySqlCommand query = new MySqlCommand(string.Format("TRUNCATE TABLE {0}.roms", this.database), this.connection))
                {
                    query.ExecuteNonQuery();
                }

                using (MySqlCommand query = new MySqlCommand(string.Format("SELECT COUNT(*) FROM {0}.roms", this.database), this.connection))
                {
                    return Convert.ToInt32(query.ExecuteScalar()) == 0;
                }
            }
            finally
            {
                connection.Close();
            }
        }

        public bool AddRomEntry(string name, string description, string coverUrl, string romUrl)
        {
            try
            {
                using (MySqlCommand query = new MySqlCommand(string.Format("INSERT INTO {0}.roms(Name,Description,CoverUrl,RomUrl) VALUES(@name, @desc, @cover, @rom)", this.database), this.connection))
                {
                    connection.Open();
                    query.Parameters.AddWithValue("@name", name);
                    query.Parameters.AddWithValue("@desc", description);
                    query.Parameters.AddWithValue("@cover", coverUrl);
                    query.Parameters.AddWithValue("@rom", romUrl);
                    return query.ExecuteNonQuery() == 1;
                }
            }
            finally
            {
                connection.Close();
            }
        }
    }
}
