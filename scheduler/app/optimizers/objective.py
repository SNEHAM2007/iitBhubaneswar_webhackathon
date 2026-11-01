
from ortools.sat.python import cp_model


class ScheduleObjective:

    def __init__(self):
        self.penalty_terms = []

    def add_penalty(self, variable, weight=1):
        """
        Add a weighted penalty to the objective.
        Lower total penalty is better.
        """
        if weight < 0:
            raise ValueError("Penalty weight cannot be negative")

        self.penalty_terms.append(variable * weight)

    def add_penalties(self, penalty_terms):
        """
        Add multiple penalty expressions.
        """
        self.penalty_terms.extend(penalty_terms)

    def apply(self, model):
        """
        Apply the objective to the OR-Tools model.
        """
        if not self.penalty_terms:
            model.Minimize(0)
            return

        model.Minimize(sum(self.penalty_terms))


def create_objective(model, penalty_terms):
    """
    Convenience function to minimize all penalties.
    """
    objective = ScheduleObjective()
    objective.add_penalties(penalty_terms)
    objective.apply(model)

    return objective
