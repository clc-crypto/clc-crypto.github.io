echo -e "\n\nSETTING UP CLC MINER..."
echo "Will you be pool mining? (y/n)"
read solo
if [ "$solo" == "y" ]; then
        echo 'server = "https://clc.ix.tc:6066"' > clc-miner2/clcminer.toml
        echo "Create your pool secret / password. Make it a difficult-to-guess password."
        read pool_secret
        echo "pool_secret = \"$pool_secret\"" >> clc-miner2/clcminer.toml
else
        echo 'server="https://clc.ix.tc"' > clc-miner2/clcminer.toml
fi

echo -e "\nHow many threads would you like to use? (enter 'max' for maximum usage)"
read thrds_raw

if [ "$thrds_raw" == "max" ]; then
        threads=-1
else
        threads=$thrds_raw
fi

echo 'rewards_dir = "./rewards"' >> clc-miner2/clcminer.toml
echo "thread = $threads" >> clc-miner2/clcminer.toml

echo "Would you like to set up reporting? (y/n)"
read report

if [ "$report" == "y" ]; then
        echo "Please enter your reporting username (any string of letters and numbers)"
        read report_user
        echo "[reporting]" >> clc-miner2/clcminer.toml
        echo "report_user = \"$report_user\"" >> clc-miner2/clcminer.toml
        echo 'report_server = "https://clc.ix.tc:3000"' >> clc-miner2/clcminer.toml
fi

echo -e "\n\nDONE SETTING UP CLC MINER!\n\n"
echo "Config file:"
cat clc-miner2/clcminer.toml

echo -e "\nRUN THE MINER WITH:\n./mine.sh"