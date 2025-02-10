saved_result_path = 'intermediate_results/current_result'


def get_saved_result_path(id: int):
    return saved_result_path + str(id) + '.pkl'
