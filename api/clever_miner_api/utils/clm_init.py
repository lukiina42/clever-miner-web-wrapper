import os
import pandas as pd
from cleverminer import cleverminer

from ..utils.remove_file import remove_file
from ..utils.s3 import download_s3_file


def clm_init(s3_key: str):
    script_dir = os.path.dirname(os.path.abspath(__file__))  # Get the script's directory
    file_path = os.path.join(script_dir, 'empty.txt')
    init_file = pd.read_csv(file_path, encoding='cp1250', sep=' ')
    clm = cleverminer(df=init_file, proc='CFMiner',
                      quantifiers={'Base': 0},
                      ante={
                          'attributes': [
                              {'name': 'AgeStatus', 'type': 'subset', 'minlen': 1, 'maxlen': 1}
                          ], 'minlen': 1, 'maxlen': 1, 'type': 'con'},
                      succ={
                          'attributes': [
                              {'name': 'income', 'type': 'subset', 'minlen': 1, 'maxlen': 1}
                          ], 'minlen': 1, 'maxlen': 1, 'type': 'con'}
                        )

    download_s3_file(s3_key, "temp_clm_file.pkl")
    clm.load("temp_clm_file.pkl")
    remove_file('../../temp_clm_file.pkl')

    return clm